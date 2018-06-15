const cash = require("cash");
import {spawnSync} from "child_process";

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

export function make_dir(path: string) {
  cash.mkdir(path, {parents: true});
}

export function print(txt: string, lb: string = "\n") {
  process.stdout.write(txt + lb);
}

export function print_error(txt: string, lb: string = "\n") {
  process.stderr.write(txt + lb);
}
