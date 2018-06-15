import * as fs from "fs";
import * as path from "path";
import {BuildInformation, getBuildInformation} from "./release";
import {PACKAGES, run, copy, make_dir, remove_dir, print, print_error} from "./common";

try {
  main();
} catch (e) {
  print_error(e.message);
  process.exit(1);
}

function main() {
  const buildInfo = getBuildInformation();

  if (buildInfo.release) {
    print("> Release build.");
    // Update npm package version.
    run("npm", ["version", buildInfo.version, "--no-git-tag-version"]);
  }

  build(buildInfo);
}

function build(buildInfo: BuildInformation) {
  const ROOT_DIR = process.cwd();
  const UGLIFYJS = path.join(ROOT_DIR, "node_modules", "uglify-es", "bin", "uglifyjs");

  print(`====== BUILDING: Version ${buildInfo.version}`);

  const README = `${ROOT_DIR}/README.md`;

  for (const PACKAGE of PACKAGES) {

    const SRC_DIR = path.join(ROOT_DIR, "packages", PACKAGE);
    const SRC_PACKAGE_JSON = path.join(SRC_DIR, "package.json");
    const SRC_WEBPACK_CONFIG = path.join(SRC_DIR, "webpack.config.js");
    const OUT_PACKAGES_DIR = path.join(ROOT_DIR, "dist", "packages");
    const OUT_DIR = path.join(OUT_PACKAGES_DIR, PACKAGE);
    const OUT_DIR_FILENAME = path.join(OUT_DIR, `lokidb.${PACKAGE}.js`);
    const OUT_DIR_FILENAME_MINIFIED = path.join(OUT_DIR, `lokidb.${PACKAGE}.min.js`);
    const NPM_PACKAGES_DIR = path.join(ROOT_DIR, "dist", "packages-npm");
    const NPM_DIR = path.join(NPM_PACKAGES_DIR, PACKAGE);
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
    copy(OUT_DIR, NPM_PACKAGES_DIR, true);
    copy(SRC_PACKAGE_JSON, NPM_DIR);
    copy(README, NPM_DIR);

    print(`======      [${PACKAGE}]: MINIFY     =====`);
    run("node", [UGLIFYJS, OUT_DIR_FILENAME, "--output", OUT_DIR_FILENAME_MINIFIED]);

    print(`======      [${PACKAGE}]: VERSIONING =====`);
    const data = fs.readFileSync(NPM_PACKAGE_JSON).toString("utf8");
    let json = JSON.parse(data);
    json.version = buildInfo.version;
    // Update version of other needed LokiDB packages
    if (json.dependencies) {
      for (let pack of Object.keys(json.dependencies)) {
        if (pack.startsWith("@lokidb/")) {
          json.dependencies[pack] = buildInfo.version;
        }
      }
    }
    if (json.optionalDependencies) {
      for (let pack of Object.keys(json.optionalDependencies)) {
        if (pack.startsWith("@lokidb/")) {
          json.optionalDependencies[pack] = buildInfo.version;
        }
      }
    }
    fs.writeFileSync(NPM_PACKAGE_JSON, JSON.stringify(json, null, 2));
  }
}
