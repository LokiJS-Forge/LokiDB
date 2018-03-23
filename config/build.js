/* global require */
"use strict";

const {spawn, spawnSync} = require("child_process");
const fs = require("fs");
const process = require("process");
const stream = require("stream");
const conventionalChangelog = require("conventional-changelog");

const PACKAGES = [
  "loki",
  "partitioning-adapter",
  "local-storage",
  "indexed-storage",
  "fs-storage",
  "memory-storage",
  "full-text-search",
  "full-text-search-language",
  "full-text-search-language-de",
  "full-text-search-language-en",
];

const ROOT_DIR = process.cwd();

// Check git status.
const IS_PULL_REQUEST = process.env.TRAVIS_PULL_REQUEST !== "false";
const IS_MASTER_TARGET = process.env.TRAVIS_BRANCH === process.env.GIT_BRANCH;
const COMMIT_TAG = process.env.TRAVIS_TAG;
const GH_TOKEN = process.env.GH_TOKEN;
const TRAVIS_REPO_SLUG = process.env.TRAVIS_REPO_SLUG;
const CHANGELOG = {
  file: "CHANGELOG.md",
  header: "",
  body: "",
  changes: "",
  get log() {
    if (this.body) {
      return this.header + "\n\n" + this.body + "\n\n## Commit Summary\n" + this.changes + "\n\n\n";
    } else {
      return this.header + "\n\n\n" + this.changes + "\n\n\n";
    }
  },
  get log_without_head() {
    if (this.body) {
      return this.body + "\n\n##Commit Summary" + this.changes;
    } else {
      return this.changes;
    }
  },
  get version_and_date() {
    const version = this.header.split("\n")[1];
    return version.substr(version.search(" ") + 1);
  }
};

let DO_RELEASE = false;
let VERSION = "0.0.0.0";
let CURRENT_COMMIT;
let RELEASE_BRANCH = "";
const RELEASE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

async function main() {
  try {
    fetch_all();
    DO_RELEASE = check_if_release_is_triggered();

    if (DO_RELEASE) {
      print("! Release !");
      update_version();
    }
    VERSION = require("./../package.json").version;

    build();

    if (DO_RELEASE) {
      RELEASE_BRANCH = "Releasing_" + VERSION;

      await update_changelog();
      push();

      await delay_release();

      await npm_login();
      npm_publish();
      merge();
    }
  } catch (e) {
    print_error(e.message);
    process.exit(1);
  }
}

main().then(() => {
  process.exit(0);
}).catch((e) => {
  print_error(e.message);
  process.exit(1);
});

function update_version() {
  const version_skip = COMMIT_TAG.match(/Release_(.+)/)[1];
  run("npm", ["version", version_skip, "--no-git-tag-version"]);
}

function push() {
  run("git", ["checkout", "-b", RELEASE_BRANCH]);
  run("git", ["add", "-u"]);
  run("git", ["add", "dist/*"]);
  run("git", ["commit", "-m", `Release ${VERSION}`]);
  run("git", ["remote", "set-url", "origin", `https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git`]);
  run("git", ["push", "--set-upstream", "origin", RELEASE_BRANCH]);
}

function merge() {
  run("git", ["checkout", "master"]);
  run("git", ["merge", RELEASE_BRANCH]);

  run("git", ["push", "origin", `:refs/tags/${COMMIT_TAG}`]);
  run("git", ["tag", VERSION]);

  run("git", ["push"]);
  run("git", ["tag", "-d", COMMIT_TAG]);
  run("git", ["push", "--tags"]);

  // Remove release branch.
  run("git", ["branch", "-d", RELEASE_BRANCH]);
  run("git", ["push", "origin", "--delete", RELEASE_BRANCH]);

  print("====== Create GitHub release documentation");

  const release = {
    "tag_name": VERSION,
    "target_commitish": "master",
    "name": CHANGELOG.version_and_date,
    "body": CHANGELOG.log_without_head,
    "draft": false,
    "prerelease": false
  };
  run("curl", ["--request", "POST", "--data", JSON.stringify(release), `https://${GH_TOKEN}@api.github.com/repos/${TRAVIS_REPO_SLUG}/releases`]);

  print("====== Update documentation");
  run("mkdocs", ["gh-deploy"]);
}

function build() {
  const UGLIFYJS = `${ROOT_DIR}/node_modules/uglify-es/bin/uglifyjs`;

  print(`====== BUILDING: Version ${VERSION} (${CURRENT_COMMIT})`);

  for (const PACKAGE of PACKAGES) {

    const SRC_DIR = `${ROOT_DIR}/packages/${PACKAGE}`;
    const OUT_DIR = `${ROOT_DIR}/dist/packages/${PACKAGE}`;
    const NPM_DIR = `${ROOT_DIR}/dist/packages-dist/${PACKAGE}`;
    const FILENAME = `lokidb.${PACKAGE}.js`;
    const FILENAME_MINIFIED = `lokidb.${PACKAGE}.min.js`;

    print(`======      [${PACKAGE}]: PACKING    =====`);
    remove_dir(OUT_DIR);

    run("webpack", [`--config=${SRC_DIR}/webpack.config.js`, `--output-path=${OUT_DIR}`]);

    // Update script tag export of UMD to use default module export.
    // Get script tag export.
    let script = run("grep", ["-n", "root\\[.*] = factory(", OUT_DIR + "/" + FILENAME])[1].toString();
    let library_name = script.match(/root\["@lokidb\/(.+?)"/)[1];
    // Transform library name to Loki<LibraryName>.
    let simple_name = library_name.replace(/(?:-|^)([a-z])/ig, ( all, letter ) => {
      return letter.toUpperCase();
    });
    if (!simple_name.startsWith("Loki")) {
      simple_name = "Loki" + simple_name;
    }

    // Get line number of script tag.
    const ln = script.match(/(\d+).*/)[1];
    // Add simple name as default export.
    run("sed", ["-i", "-E",
      `${ln}s/(.+);/{\\1; root["${simple_name}"] = root["@lokidb\\/${library_name}"].default;}/`, OUT_DIR + "/" + FILENAME]);

    print(`======      [${PACKAGE}]: BUNDLING   =====`);
    remove_dir(NPM_DIR);
    make_dir(NPM_DIR);

    run("rsync", ["-a", `${OUT_DIR}/`, `${NPM_DIR}`]);
    run("rsync", ["-am", "--include=package.json", "--include=*/", "--exclude=*", `${SRC_DIR}/`, `${NPM_DIR}/`]);

    print(`======      [${PACKAGE}]: MINIFY     =====`);
    run(UGLIFYJS, [`${OUT_DIR}/${FILENAME}`, "--output", `${OUT_DIR}/${FILENAME_MINIFIED}`]);

    print(`======      [${PACKAGE}]: VERSIONING =====`);
    const data = fs.readFileSync(`${NPM_DIR}/package.json`);
    let json = JSON.parse(data);
    json.version = VERSION;
    // Update version of other needed LokiDB packages
    if (json.dependencies) {
      for (let pack of Object.keys(json.dependencies)) {
        if (pack.startsWith("@lokidb/")) {
          json.dependencies[pack] = VERSION;
        }
      }
    }
    if (json.optionalDependencies) {
      for (let pack of Object.keys(json.optionalDependencies)) {
        if (pack.startsWith("@lokidb/")) {
          json.optionalDependencies[pack] = VERSION;
        }
      }
    }
    fs.writeFileSync(`/${NPM_DIR}/package.json`, JSON.stringify(json, null, 2));
  }
}

function check_if_release_is_triggered() {
  if (!IS_PULL_REQUEST && !IS_MASTER_TARGET && COMMIT_TAG.startsWith("Release")) {
    // Safe current commit.
    run("git", ["checkout", "master"]);
    // Check if head has the same tag.
    const is_release = run("git", ["describe", "--tags", "--always"])[1].toString() === COMMIT_TAG + "\n";
    // Go back to current commit.
    run("git", ["checkout", CURRENT_COMMIT]);
    return is_release;
  }
  return false;
}

function npm_login() {
  return new Promise((resolve, reject) => {
    // Login to npm.
    const username = process.env.NPM_USERNAME;
    const password = process.env.NPM_PASSWORD;
    const email = process.env.NPM_EMAIL;

    if (!username || !password || !email || !email.includes("@")) {
      reject(Error("Login data not set probably."));
    }

    // Write to stdin to login.
    const npmLogin = spawn("npm", ["login"]);
    npmLogin.stdout.on("data", (data) => {
      const msg = data.toString();
      if (msg.startsWith("Username")) {
        npmLogin.stdin.write(username + "\n");
      } else if (msg.startsWith("Password")) {
        npmLogin.stdin.write(password + "\n");
      } else if (msg.startsWith("Email")) {
        npmLogin.stdin.write(email + "\n");
      }
    });
    npmLogin.stderr.on("data", (data) => {
      print_error(data.toString());
      npmLogin.stdout.destroy();
      npmLogin.stderr.destroy();
      npmLogin.stdin.end();
    });
    npmLogin.on("close", (code) => {
      if (code !== 0) {
        reject(Error("NPM login failed."));
      }
      resolve();
    });
  });
}

function npm_publish() {
  print(`====== PUBLISHING: Version ${VERSION}`);

  for (const PACKAGE of PACKAGES) {
    run("npm", ["publish", `${ROOT_DIR}/dist/packages-dist/${PACKAGE}`, "--access=public"]);
    print(`======      [${PACKAGE}]: PUBLISHED =====`);
  }
}

async function update_changelog() {
  await generate_changelog();
  if (fs.existsSync(CHANGELOG.file)) {
    const data = fs.readFileSync(CHANGELOG.file);
    fs.writeFileSync(CHANGELOG.file, CHANGELOG.log + data);
  } else {
    fs.writeFileSync(CHANGELOG.file, CHANGELOG.log);
  }
}

function generate_changelog() {
  return new Promise((resolve, reject) => {
    // Initiate the source
    let changelog_buffer = new stream.PassThrough();

    let changelog = "";
    changelog_buffer.on("data", (data) => {
      changelog += data.toString();
    });

    changelog_buffer.on("error", (error) => {
      reject(error);
    });

    changelog_buffer.on("end", () => {
      let changelog_lines = changelog.split("\n");

      CHANGELOG.header = changelog_lines.splice(0, 2).join("\n");
      CHANGELOG.changes = changelog_lines.splice(2, changelog_lines.length - 6).join("\n");

      // Get changelog body.
      let tag_message = run("git", ["cat-file", "-p", COMMIT_TAG])[1].toString().split("\n");
      if (tag_message[0].startsWith("object")) {
        CHANGELOG.body = tag_message.slice(5).join("\n");
      }

      resolve();
    });

    // Generate changelog from commit messages.
    conventionalChangelog({
      preset: "angular"
    }).pipe(changelog_buffer);
  });
}

function delay_release() {
  // Delay the release to cancel.
  print("Delayed release for " + (RELEASE_TIMEOUT / 60000) + " minutes.");
  const current_time = new Date().getTime();
  return new Promise(function (resolve) {
    function echo() {
      print(".", "");
      if (current_time + RELEASE_TIMEOUT >= new Date().getTime()) {
        setTimeout(echo, 60000);
      } else {
        print("");
        resolve();
      }
    }

    echo();
  });
}

function fetch_all() {
  run("git", ["config", "--replace-all", "remote.origin.fetch", "+refs/heads/*:refs/remotes/origin/*"]);
  run("git", ["fetch"]);
  run("git", ["fetch", "--tags"]);
  CURRENT_COMMIT = run("git", ["rev-parse", "HEAD"])[1].toString().slice(0, -1);
}

function run(command, args = [], object = {}) {
  const child = spawnSync(command, args, object);
  if (child.status !== 0) {
    throw Error("Process failed: " + command + " " + args.join(" ") + "\n"
      + (child.error ? child.error.message : child.output));
  }
  return child.output;
}

function remove_dir(path) {
  run("rm", ["-rf", path]);
}

function make_dir(path) {
  run("mkdir", ["-p", path]);
}

function print(txt, lb = "\n") {
  process.stdout.write(txt + lb);
}

function print_error(txt, lb = "\n") {
  process.stderr.write(txt + lb);
}
