const common = require("./common");

const ROOT_DIRECTORY = common.getRootDirectory();

// Bundle all packages.
const packages = common.PACKAGES.map((packageName) => `@lokidb/${packageName}`);

common.print("Uninstall all @lokidb packages...");

// Uninstall packages.
common.run("npm", ["uninstall", "--prefix", ROOT_DIRECTORY, ...packages]);
