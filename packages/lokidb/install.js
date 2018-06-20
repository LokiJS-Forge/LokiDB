const common = require("./common");

const ROOT_DIRECTORY = common.getRootDirectory();
const PACKAGE_JSON = common.getRootPackageJSON();

let DEPENDENCY_ARGUMENT = "";
const DEPENDENCY_TYPE = common.getPackageDependencyType(PACKAGE_JSON, "lokidb");
if (DEPENDENCY_TYPE === "production") {
  DEPENDENCY_ARGUMENT = "--save-prod";
} else if (DEPENDENCY_TYPE === "development") {
  DEPENDENCY_ARGUMENT = "--save-dev";
}

// Bundle all packages.
const packages = common.PACKAGES.map((packageName) => `@lokidb/${packageName}`);

common.print("Install all @lokidb packages...");

// Install packages.
common.run("npm", ["install", "--prefix", ROOT_DIRECTORY, DEPENDENCY_ARGUMENT, ...packages]);
