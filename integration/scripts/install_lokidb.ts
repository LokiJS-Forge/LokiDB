import {copy, makeDir} from "../../scripts/common";

makeDir("node_modules/@lokidb");
copy("../dist/packages-dist/*", "node_modules/@lokidb/", true);
