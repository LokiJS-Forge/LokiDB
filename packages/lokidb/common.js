const {spawn} = require("child_process");
const fs = require("fs");
const path = require("path");

const PACKAGES = [
  "fs-storage",
  "full-text-search",
  "full-text-search-language",
  "full-text-search-language-de",
  "full-text-search-language-en",
  "indexed-storage",
  "local-storage",
  "loki",
  "memory-storage",
  "partitioning-adapter",
];

/// MIT © Sindre Sorhus
function pathExistsSync(fp) {
  try {
    fs.accessSync(fp);
    return true;
  } catch (err) {
    return false;
  }
}

/// MIT © Sindre Sorhus
function locatePathSync(iterable, options) {
  options = Object.assign({
    cwd: process.cwd()
  }, options);

  for (const el of iterable) {
    if (pathExistsSync(path.resolve(options.cwd, el))) {
      return el;
    }
  }
}

/// MIT © Sindre Sorhus
function findUpSync(filename, opts = {}) {
  let dir = path.resolve(opts.cwd || "");
  const {root} = path.parse(dir);

  const filenames = [].concat(filename);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const file = locatePathSync(filenames, {cwd: dir});

    if (file) {
      return path.join(dir, file);
    }

    if (dir === root) {
      return null;
    }

    dir = path.dirname(dir);
  }
}

function getRootDirectory() {
  return process.env.INIT_CWD || path.dirname(findUpSync("package.json"));
}

function getRootPackageJSON() {
  return require(path.join(getRootDirectory(), "package.json"));
}

function getPackageDependencyType(packageJson, packageName) {
  if (packageJson.dependencies && Object.keys(packageJson.dependencies).includes(packageName)) {
    return "production";
  } else if (packageJson.devDependencies && Object.keys(packageJson.devDependencies).includes(packageName)) {
    return "development";
  }
  return null;
}

function run(command, args = []) {
  const child = spawn(command, args);
  child.stdout.on("data", (data) => {
    console.log(data.toString("utf8"));
  });
  child.stderr.on("data", (data) => {
    console.error(data.toString("utf8"));
  });
}

function print(txt, lb = "\n") {
  process.stdout.write(txt + lb);
}

module.exports = {
  PACKAGES,
  getRootDirectory,
  getRootPackageJSON,
  getPackageDependencyType,
  run,
  print
};
