import {PACKAGES, run, copy, make_dir, remove_dir, print, print_error} from "./common";
import * as path from "path";
import {readFileSync, writeFileSync} from "fs";

const ROOT_DIR = process.cwd();

// Check git status.
const IS_PULL_REQUEST = process.env.TRAVIS_PULL_REQUEST !== "false";
const IS_MASTER_TARGET = process.env.TRAVIS_BRANCH === process.env.GIT_BRANCH;
const COMMIT_TAG = process.env.TRAVIS_TAG;

let DO_RELEASE = false;
let VERSION = "0.0.0.0";
let CURRENT_COMMIT: string = null;





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

    // if (DO_RELEASE) {
    //   RELEASE_BRANCH = "Releasing_" + VERSION;
    //
    //   await update_changelog();
    //   push();
    //
    //   await delay_release();
    //
    //   await npm_login();
    //   npm_publish();
    //   merge();
    // }
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

function build() {
  const UGLIFYJS = path.join(ROOT_DIR, "node_modules", "uglify-es", "bin", "uglifyjs");

  print(`====== BUILDING: Version ${VERSION} (${CURRENT_COMMIT})`);

  const README = `${ROOT_DIR}/README.md`;

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
      let simple_name = library_name.replace(/(?:-|^)([a-z])/ig, (_, letter) => {
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

    print(`======      [${PACKAGE}]: VERSIONING =====`);
    const data = fs.readFileSync(NPM_PACKAGE_JSON).toString("utf8");
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

function fetch_all() {
  run("git", ["config", "--replace-all", "remote.origin.fetch", "+refs/heads/*:refs/remotes/origin/*"]);
  run("git", ["fetch"]);
  run("git", ["fetch", "--tags"]);
  CURRENT_COMMIT = run("git", ["rev-parse", "HEAD"])[1].toString().slice(0, -1);
}
