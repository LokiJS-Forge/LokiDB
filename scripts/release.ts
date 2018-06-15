// Check git status.
import {run} from "./common";

const IS_PULL_REQUEST = process.env.TRAVIS_PULL_REQUEST !== "false";
const IS_MASTER_TARGET = process.env.TRAVIS_BRANCH === process.env.GIT_BRANCH;
const COMMIT_TAG = process.env.TRAVIS_TAG;

let CURRENT_COMMIT: string = null;

export type BuildInformation = {
  release: boolean;
  version: string;
};

export function getBuildInformation(): BuildInformation {
  fetchBranchesAndTags();

  const buildInformation: BuildInformation = {
    release: false,
    version: require("../package.json").version,
  };

  buildInformation.release = checkIfReleaseMode();

  if (buildInformation.release) {
    buildInformation.version = COMMIT_TAG.match(/Release_(.+)/)[1];
  }

  return buildInformation;
}


function fetchBranchesAndTags() {
  run("git", ["config", "--replace-all", "remote.origin.fetch", "+refs/heads/*:refs/remotes/origin/*"]);
  run("git", ["fetch"]);
  run("git", ["fetch", "--tags"]);
  CURRENT_COMMIT = run("git", ["rev-parse", "HEAD"])[1].toString().slice(0, -1);
}

function checkIfReleaseMode() {
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
