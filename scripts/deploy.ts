import * as fs from "fs";
import * as stream from "stream";
import {PACKAGES, print, print_error, run} from "./common";
import {getBuildInformation} from "./release";
import * as child_process from 'child_process';

const conventionalChangelog = require("conventional-changelog");

const RELEASE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
let RELEASE_BRANCH = "";

const GH_TOKEN = process.env.GH_TOKEN;
const COMMIT_TAG = process.env.TRAVIS_TAG;
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

const BUILD_INFO = getBuildInformation();

main();

function main() {
  if (BUILD_INFO.release) {
    RELEASE_BRANCH = "Releasing_" + BUILD_INFO.release;

    updateChangelog()
      .then(() => prepareReleaseBranch())
      .then(() => delayRelease())
      .then(() => loginToNPM())
      .then(() => {
        publishToNPM();
        mergeReleaseBranch();
      });
  } else {
    print("Nothing to deploy...");
  }
}

function loginToNPM() {
  return new Promise((resolve, reject) => {
    // Login to npm.
    const username = process.env.NPM_USERNAME;
    const password = process.env.NPM_PASSWORD;
    const email = process.env.NPM_EMAIL;

    if (!username || !password || !email || !email.includes("@")) {
      reject(Error("Login data not set probably."));
    }

    // Write to stdin to login.
    const npmLogin = child_process.spawn("npm", ["login"]);
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

function publishToNPM() {
  print(`====== PUBLISHING: Version ${BUILD_INFO.version}`);

  for (const PACKAGE of PACKAGES) {
    // run("npm", ["publish", `${ROOT_DIR}/dist/packages-dist/${PACKAGE}`, "--access=public"]);
    print(`======      [${PACKAGE}]: PUBLISHED =====`);
  }
}

async function updateChangelog() {
  await generateChangelog();
  if (fs.existsSync(CHANGELOG.file)) {
    const data = fs.readFileSync(CHANGELOG.file);
    fs.writeFileSync(CHANGELOG.file, CHANGELOG.log + data);
  } else {
    fs.writeFileSync(CHANGELOG.file, CHANGELOG.log);
  }
}

function generateChangelog() {
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

function delayRelease() {
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

function prepareReleaseBranch() {
  if (!process.env.ABC) return;
  run("git", ["checkout", "-b", RELEASE_BRANCH]);
  run("git", ["add", "-u"]);
  run("git", ["add", "dist/packages/*"]);
  run("git", ["commit", "-m", `Release ${BUILD_INFO.version}`]);
  run("git", ["remote", "set-url", "origin", `https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git`]);
  run("git", ["push", "--set-upstream", "origin", RELEASE_BRANCH]);
}

function mergeReleaseBranch() {
  if (!process.env.ABC) return;
  run("git", ["checkout", "master"]);
  run("git", ["merge", RELEASE_BRANCH]);

  run("git", ["push", "origin", `:refs/tags/${COMMIT_TAG}`]);
  run("git", ["tag", BUILD_INFO.version]);

  run("git", ["push"]);
  run("git", ["tag", "-d", COMMIT_TAG]);
  run("git", ["push", "--tags"]);

  // Remove release branch.
  run("git", ["branch", "-d", RELEASE_BRANCH]);
  run("git", ["push", "origin", "--delete", RELEASE_BRANCH]);

  print("====== Create GitHub release documentation");

  const release = {
    "tag_name": BUILD_INFO.version,
    "target_commitish": "master",
    "name": CHANGELOG.version_and_date,
    "body": CHANGELOG.log_without_head,
    "draft": false,
    "prerelease": false
  };
  run("curl", ["--request", "POST", "--data", JSON.stringify(release),
    `https://${GH_TOKEN}@api.github.com/repos/${TRAVIS_REPO_SLUG}/releases`]);

  print("====== Update documentation");
  run("mkdocs", ["gh-deploy"]);
}
