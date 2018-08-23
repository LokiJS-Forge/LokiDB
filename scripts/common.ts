import {spawnSync} from "child_process";

const cash = require("cash");

export const PACKAGES = [
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

export function run(command: string, args: string[] = [], object: { shell?: boolean } = {}) {
  if (object.shell === undefined) {
    object.shell = true;
  }
  const child = spawnSync(command, args, object);
  if (child.status !== 0) {
    throw Error("Process failed: " + command + " " + args.join(" ") + "\n"
      + (child.error ? child.error.message : child.output));
  }
  return child.output;
}

export function copy(src: string, dst: string, recursive = false) {
  cash.cp(`${src} ${dst}`, {recursive: recursive});
}

export function remove_dir(path: string) {
  cash.rm(path, {recursive: true});
}

export function makeDir(path: string) {
  cash.mkdir(path, {parents: true});
}

export function print(txt: string, lb: string = "\n") {
  process.stdout.write(txt + lb);
}

export function printError(txt: string, lb: string = "\n") {
  process.stderr.write(txt + lb);
}

const IS_PULL_REQUEST = process.env.TRAVIS_PULL_REQUEST !== "false";
const IS_MASTER_TARGET = process.env.TRAVIS_BRANCH === process.env.GIT_BRANCH;
const COMMIT_TAG = process.env.TRAVIS_TAG;

export type BuildInformation = {
  release: boolean;
  version: string;
};

export function getBuildInformation(optional_fetch: boolean): BuildInformation {
  try {
    fetchBranchesAndTags();
  } catch (e) {
    if (!optional_fetch) {
      throw e;
    }
  }

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
