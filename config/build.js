/* global require */
"use strict";

const {spawn, spawnSync} = require("child_process");
const fs = require("fs");
const cash = require("cash");
const path = require("path");
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
let DO_DOCUMENTATION_UPDATE = false;
let VERSION = "0.0.0.0";
let CURRENT_COMMIT;
let RELEASE_BRANCH = "";
const RELEASE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

async function main() {
  try {
    fetch_all();
    DO_RELEASE = check_if_release_is_triggered();
    DO_DOCUMENTATION_UPDATE = DO_RELEASE || check_if_documentation_update_is_triggered();

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

    if (DO_DOCUMENTATION_UPDATE) {
      update_documentation();
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
  run("git", ["add", "dist/packages/*"]);
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
  run("curl", ["--request", "POST", "--data", JSON.stringify(release),

function update_documentation() {
  print("====== Update documentation");
  run("npm", ["run", "docs"]);
  run("mkdocs", ["gh-deploy"]);
}

function build() {
  const UGLIFYJS = path.join(ROOT_DIR, "node_modules", "uglify-es", "bin", "uglifyjs");

  print(`====== BUILDING: Version ${VERSION} (${CURRENT_COMMIT})`);

  const README = `${ROOT_DIR}/README.md`;

  const DOC_DIR = `${ROOT_DIR}/docs/js/@lokijs`;
  mkdir(DOC_DIR);

  for (const PACKAGE of PACKAGES) {

    const SRC_DIR = path.join(ROOT_DIR, "packages", PACKAGE);
    const SRC_PACKAGE_JSON = path.join(SRC_DIR, "package.json");
    const SRC_WEBPACK_CONFIG = path.join(SRC_DIR, "webpack.config.js");
    const OUT_DIR = path.join(ROOT_DIR, "dist", "packages", PACKAGE);
    const OUT_DIR_FILENAME = path.join(OUT_DIR, `lokidb.${PACKAGE}.js`);
    const OUT_DIR_FILENAME_MINIFIED = path.join(OUT_DIR, `lokidb.${PACKAGE}.min.js`);
    const NPM_DIR = path.join(ROOT_DIR, "dist", "packages-dist", PACKAGE);
    const NPM_PACKAGE_JSON = path.join(NPM_DIR, "package.json");

    print(`======      [${PACKAGE}]: PACKING    =====`);
    remove_dir(OUT_DIR);

    run("webpack-cli", ["--config=" + SRC_WEBPACK_CONFIG, "--output-path=" + OUT_DIR]);

    // Update script tag export of UMD to use default module export.
    {
      const bundle = fs.readFileSync(OUT_DIR_FILENAME).toString();

      // Split on script export of UMD.
      const script_start = bundle.search(/root\[.+] = factory.+\);/);
      const script_end = script_start + bundle.slice(script_start).indexOf(";") + 1;

      const umd_part = bundle.slice(0, script_start);
      let script_part = bundle.slice(script_start, script_end);
      const library_part = bundle.slice(script_end);

      // Update script tag export of UMD to use default module export.
      let library_name = script_part.match(/root\["@lokidb\/(.+?)"/)[1];
      // Transform library name to Loki<LibraryName>.
      let simple_name = library_name.replace(/(?:-|^)([a-z])/ig, (all, letter) => {
        return letter.toUpperCase();
      });
      if (!simple_name.startsWith("Loki")) {
        simple_name = "Loki" + simple_name;
      }

      // Add default export to script.
      script_part = `{ ${script_part} root["${simple_name}"] = root["@lokidb/${library_name}"].default; }`;
      fs.writeFileSync(OUT_DIR_FILENAME, umd_part + script_part + library_part);
    }

    print(`======      [${PACKAGE}]: BUNDLING   =====`);
    remove_dir(NPM_DIR);
    make_dir(NPM_DIR);

    // Copy files to dist and npm dist.
    copy(OUT_DIR, NPM_DIR, true);
    copy(SRC_PACKAGE_JSON, NPM_DIR);
    copy(README, NPM_DIR);

    print(`======      [${PACKAGE}]: MINIFY     =====`);
    run("node", [UGLIFYJS, OUT_DIR_FILENAME, "--output", OUT_DIR_FILENAME_MINIFIED]);
    // Copy minified to docs.
    catch.cp(OUT_DIR_FILENAME_MINIFIED, DOC_DIR_FILENAME_MINIFIED);

    print(`======      [${PACKAGE}]: VERSIONING =====`);
    const data = fs.readFileSync(NPM_PACKAGE_JSON);
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
    fs.writeFileSync(NPM_PACKAGE_JSON, JSON.stringify(json, null, 2));
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

function check_if_documentation_update_is_triggered() {
  if (!IS_PULL_REQUEST && !IS_MASTER_TARGET && COMMIT_TAG === "Documentation") {
    // Safe current commit.
    run("git", ["checkout", "master"]);
    // Check if head has the same tag.
    const is_documentation_update = run("git", ["describe", "--tags", "--always"])[1].toString() === COMMIT_TAG + "\n";
    // Go back to current commit.
    run("git", ["checkout", CURRENT_COMMIT]);
    return is_documentation_update;
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
  if (!object.hasOwnProperty("shell")) {
    object.shell = true;
  }
  const child = spawnSync(command, args, object);
  if (child.status !== 0) {
    throw Error("Process failed: " + command + " " + args.join(" ") + "\n"
      + (child.error ? child.error.message : child.output));
  }
  return child.output;
}

function copy(src, dst, recursive = false) {
  cash.cp(`${src} ${dst}`, {recursive: recursive});
}

function remove_dir(path) {
  cash.rm(path, {recursive: true});
}

function make_dir(path) {
  cash.mkdir(path, {parents: true});
}

function print(txt, lb = "\n") {
  process.stdout.write(txt + lb);
}

function print_error(txt, lb = "\n") {
  process.stderr.write(txt + lb);
}
