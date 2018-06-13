let ENVIRONMENT = "browser";
if (typeof exports === 'object' && typeof module === 'object') {
  ENVIRONMENT = "node";
} else if (typeof define === 'function' && define.amd) {
  ENVIRONMENT = "amd";
} else if (typeof exports === 'object') {
  ENVIRONMENT = "commonjs"
}

function loadScriptByTag(src) {
  const script = document.createElement("script");
  script.setAttribute("src", src);
  document.head.appendChild(script);

  return new Promise(resolve => {
    script.onload = resolve
  });
}

function loadScript(name) {
  if (ENVIRONMENT === "browser") {
    return loadScriptByTag(`base/dist/packages/${name}/lokidb.${name}.js`);
  } else if (ENVIRONMENT === "node") {
    return Promise.resolve(require(`./../../../../dist/packages/${name}/lokidb.${name}.js`));
  }
}

function loadLibrary(name, dependencies) {

  let promise = Promise.resolve();
  for (let dependency of dependencies) {
    promise = promise.then(() => loadScript(dependency));
  }

  return promise
    .then(() => loadScript(name))
    .then((script) => {
      if (ENVIRONMENT === "browser") {
        return this[`@lokidb/${name}`];
      } else {
        return script;
      }
    });
}

test_integration = function (name, dependencies, tests) {
  describe(name, () => {

    let loaded = null;
    beforeEach(() => {
      loaded = loadLibrary(name, dependencies);
    });

    for (let [name, test] of Object.entries(tests)) {
      it(name, (done) => {
        loaded
          .then((parent) => {
            const target = parent[name];
            expect(target).toBeDefined();
            test(target);
            done();
          })
          .catch((e) => {
            fail(e);
            done();
          });
      });
    }

    it("coverage", (done) => {
      loaded
        .then((parent) => {
          // Remove all defined tests from exported tag.
          const defines = Object.keys(parent);
          const remaining = Object.keys(tests).filter((test) => !defines.includes(test));

          // All exported properties must be tested.
          expect(remaining).toBeEmptyArray();
          done();
        })
        .catch((e) => {
          fail(e);
          done();
        })
    });
  });
};
