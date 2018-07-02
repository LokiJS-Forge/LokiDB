import * as process from "process";
import {copy, makeDir} from "../../scripts/common";

makeDir("node_modules/@lokidb");
copy("../dist/packages-dist/*", "node_modules/@lokidb/", true);

process.exit(0);
