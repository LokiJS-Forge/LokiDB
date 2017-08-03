/* global require */
"use strict";

const {spawn, spawnSync} = require("child_process");
const fs = require("fs");
const process = require("process");
const stream = require("stream");
const conventionalChangelog = require("conventional-changelog");

process.argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});

const PACKAGES = [
  "main",
  "root"
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


let DO_DEPLOY = false;
let VERSION = "0.0.0.0";

print("PR: " + IS_PULL_REQUEST);
print("PUSH: " + IS_MASTER_TARGET);
print("Tag: " + COMMIT_TAG);

async function main() {
  DO_DEPLOY = check_if_release_is_triggered();

  if (DO_DEPLOY) {
    make_release_branch();
    update_version();
  }

  VERSION = require("./package.json").version;

  build();

  if (DO_DEPLOY) {
    await update_changelog();

    await npm_login();
    npm_publish();
    merge();
  }
}

main().then(() => {
  process.exit(0);
}).catch((e) => {
  print_error(e.message);
  process.exit(1);
});

function make_release_branch() {
}

function update_version() {
  run("npm", ["version", "patch", "--no-git-tag-version"]);
}

function merge() {
  const RELEASE = "RELEASE";

  run("git", ["fetch"]);
  run("git", ["checkout", "-b", RELEASE, "origin/master"]);

  run("git", ["add", "."]);
  run("git", ["commit", "-m", `Release ${VERSION}`]);
  run("git", ["remote", "set-url", "origin", `https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git`]);

  run("git", ["checkout", "master"]);
  run("git", ["merge", RELEASE]);

  run("git", ["push", "origin", `:refs/tags/${COMMIT_TAG}`]);
  run("git", ["tag", VERSION]);

  run("git", ["push"]);
  run("git", ["tag", "-d", COMMIT_TAG]);
  run("git", ["branch", "-d", RELEASE]);
  run("git", ["push", "--tags"]);

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

  print(`====== BUILDING: Version ${VERSION}`);

  for (const PACKAGE of PACKAGES) {

    const SRC_DIR = `${ROOT_DIR}/packages/${PACKAGE}`;
    const OUT_DIR = `${ROOT_DIR}/dist/package/${PACKAGE}`;
    const NPM_DIR = `${ROOT_DIR}/dist/packages-dist/${PACKAGE}`;
    const FILENAME = `${PACKAGE}.js`;
    const FILENAME_MINIFIED = `${PACKAGE}.min.js`;

    print(`======      [${PACKAGE}]: PACKING    =====`);
    remove_dir(OUT_DIR);

    run("webpack", ["--config=config/webpack.config.js", `--entry=${SRC_DIR}/src/index.js`, `--output-library=${PACKAGE}`, `--output-path=${OUT_DIR}`, `--output-filename=${FILENAME}`]);

    print(`======      [${PACKAGE}]: BUNDLING   =====`);
    remove_dir(NPM_DIR);
    make_dir(NPM_DIR);

    run("rsync", ["-a", `${OUT_DIR}/`, `${NPM_DIR}`]);
    run("rsync", ["-am", "--include=package.json", "--include=*/", "--exclude=*", `${SRC_DIR}/`, `${NPM_DIR}/`]);

    print(`======      [${PACKAGE}]: MINIFY     =====`);
    run(UGLIFYJS, [`${OUT_DIR}/${FILENAME}`, "--output", `${OUT_DIR}/${FILENAME_MINIFIED}`]);

    if (DO_DEPLOY) {
      print(`======      [${PACKAGE}]: VERSIONING =====`);
      const data = fs.readFileSync(`${NPM_DIR}/package.json`);
      let json = JSON.parse(data);
      json.version = VERSION;
      fs.writeFileSync(`/${NPM_DIR}/package.json`, JSON.stringify(json, null, 2));
    }
  }
}

function check_if_release_is_triggered() {
  if (!IS_PULL_REQUEST && !IS_MASTER_TARGET && COMMIT_TAG.startsWith("Release")) {
    run("git", ["fetch", "origin"]);
    run("git", ["checkout", "master"]);
    // Check if head has the same tag.
    if (run("git", ["describe", "--tags", "--always"])[1].toString() === COMMIT_TAG + "\n") {
      return true;
    }
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

function print(txt) {
  process.stdout.write(txt + "\n");
}

function print_error(txt) {
  process.stderr.write(txt + "\n");
}
