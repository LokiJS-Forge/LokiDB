let model = null;

document.addEventListener("DOMContentLoaded", function () {
  self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
      console.log(moduleId, label);
      const host = "http://localhost:8000/js/monaco/";
      if (label === 'typescript' || label === 'javascript') {
        return host + 'ts.worker.bundle.js';
      }
      return host + 'editor.worker.bundle.js';
    }
  };

  // Compiler options
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.None,
    noEmit: false,
    typeRoots: ["node_modules/@types"]
  });


  const files = [
    "memory-storage/src/memory_storage.d.ts",
    "memory-storage/src/index.d.ts",
    "full-text-search-language-en/src/index.d.ts",
    "full-text-search-language-en/src/english_analyzer.d.ts",
    "full-text-search-language/src/language.d.ts",
    "full-text-search-language/src/index.d.ts",
    "indexed-storage/src/indexed_storage.d.ts",
    "indexed-storage/src/index.d.ts",
    "fs-storage/src/fs_storage.d.ts",
    "fs-storage/src/index.d.ts",
    "full-text-search-language-de/src/german_analyzer.d.ts",
    "full-text-search-language-de/src/index.d.ts",
    "common/types.d.ts",
    "common/plugin.d.ts",
    "partitioning-adapter/src/index.d.ts",
    "partitioning-adapter/src/partitioning_adapter.d.ts",
    "local-storage/src/index.d.ts",
    "local-storage/src/local_storage.d.ts",
    "full-text-search/src/query_types.d.ts",
    "full-text-search/src/fuzzy/lev1t_parametric_description.d.ts",
    "full-text-search/src/fuzzy/lev2t_parametric_description.d.ts",
    "full-text-search/src/fuzzy/run_automaton.d.ts",
    "full-text-search/src/fuzzy/levenshtein_automata.d.ts",
    "full-text-search/src/fuzzy/parametric_description.d.ts",
    "full-text-search/src/fuzzy/automaton.d.ts",
    "full-text-search/src/fuzzy/long.d.ts",
    "full-text-search/src/full_text_search.d.ts",
    "full-text-search/src/scorer.d.ts",
    "full-text-search/src/index.d.ts",
    "full-text-search/src/index_searcher.d.ts",
    "full-text-search/src/analyzer/character_filter.d.ts",
    "full-text-search/src/analyzer/analyzer.d.ts",
    "full-text-search/src/analyzer/token_filter.d.ts",
    "full-text-search/src/analyzer/tokenizer.d.ts",
    "full-text-search/src/inverted_index.d.ts",
    "loki/src/unique_index.d.ts",
    "loki/src/clone.d.ts",
    "loki/src/helper.d.ts",
    "loki/src/dynamic_view.d.ts",
    "loki/src/index.d.ts",
    "loki/src/collection.d.ts",
    "loki/src/result_set.d.ts",
    "loki/src/event_emitter.d.ts",
    "loki/src/loki.d.ts"
  ];

  for (const file of files) {
    fetch(`js/@lokidb/types/${file}`)
      .then((data) => {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(data,
          `node_modules/@lokidb/${file.replace("/src/", "/")}`)
      });
  }

  const libs = [
    "lokidb.fs-storage.min.js",
    "lokidb.full-text-search.min.js",
    "lokidb.full-text-search-language.min.js",
    "lokidb.full-text-search-language-de.min.js",
    "lokidb.full-text-search-language-en.min.js",
    "lokidb.indexed-storage.min.js",
    "lokidb.local-storage.min.js",
    "lokidb.loki.min.js",
    "lokidb.memory-storage.min.js",
    "lokidb.partitioning-adapter.min.js"
  ];

  for (const lib of libs) {
    const s = document.createElement('script');
    s.setAttribute('src', `js/@lokidb/${lib}`);
    // s.onload = callback;
    document.body.appendChild(s);
  }

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  });

  const editor = monaco.editor.create(document.getElementById('container'), {
    model: monaco.editor.createModel([
      'import {Loki} from "@lokidb/loki"',
      'const loki = new Loki()',
      'console.log(loki);'
    ].join('\n'), 'typescript', new monaco.Uri("model+abc"))
  });

  model = editor.model;

});

function runner() {
  monaco.languages.typescript.getTypeScriptWorker()
    .then((worker) => worker(model.uri))
    .then((client) => client.getEmitOutput(model.uri.toString()))
    .then((r) => {
      try {
        exports = {};
        const code = r.outputFiles[0].text;
        console.log(code);
        eval(code);
      } catch (e) {
        console.error(e);
      }
    });
}

