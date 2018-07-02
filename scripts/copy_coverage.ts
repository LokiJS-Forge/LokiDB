import {copy, makeDir} from "./common";

makeDir("coverage/tmp");
makeDir("coverage/combined");
copy("coverage/karma/coverage-final.json", "coverage/tmp/karma.coverage.json");
copy("coverage/node/coverage-final.json", "coverage/tmp/node.coverage.json");
