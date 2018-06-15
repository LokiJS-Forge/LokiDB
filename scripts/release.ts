// Check git status.
import {run} from "./common";

const IS_PULL_REQUEST = process.env.TRAVIS_PULL_REQUEST !== "false";
const IS_MASTER_TARGET = process.env.TRAVIS_BRANCH === process.env.GIT_BRANCH;
const COMMIT_TAG = process.env.TRAVIS_TAG;

export type BuildInformation = {
  release: boolean;
  version: string;
};

export function getBuildInformation(): BuildInformation {
  fetchBranchesAndTags();

  const buildInformation: BuildInformation = {
    release: checkIfReleaseMode(),
    version: require("../package.json").version,
  };

  if (buildInformation.release) {
    buildInformation.version = COMMIT_TAG.match(/Release_(.+)/)[1];
  }

  return buildInformation;
}

function fetchBranchesAndTags() {
  run("git", ["config", "--replace-all", "remote.origin.fetch", "+refs/heads/*:refs/remotes/origin/*"]);
  run("git", ["fetch"]);
  run("git", ["fetch", "--tags"]);
}

function checkIfReleaseMode() {
  if (!IS_PULL_REQUEST && !IS_MASTER_TARGET && COMMIT_TAG.startsWith("Release")) {
    // Safe current commit.
    const currentCommit = run("git", ["rev-parse", "HEAD"])[1].toString().slice(0, -1);
    // Check if masters head is the same as tag.
    run("git", ["checkout", "master"]);
    const is_release = run("git", ["describe", "--tags", "--always"])[1].toString() === COMMIT_TAG + "\n";
    // Go back to current commit.
    run("git", ["checkout", currentCommit]);
    return is_release;
  }
  return false;
}
