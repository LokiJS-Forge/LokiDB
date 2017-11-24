function getGlobal(): any {
  let glob;
  (function (global) {
    glob = global;
  })(global !== undefined && global || this);
  return glob;
}


function create(): void {
  const global = getGlobal();
  const sym = Symbol.for("LOKI") as any;
  if (global[sym] === undefined) {
    global[sym] = {
    };
  }
  return global[sym];
}

/**
 * @hidden
 */
export const PLUGINS = create();
