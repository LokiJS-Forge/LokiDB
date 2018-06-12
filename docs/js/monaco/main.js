let model = null;

$(document).ready(function () {
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
    module: monaco.languages.typescript.ModuleKind.UMD,
    noEmit: false,
    typeRoots: ["node_modules/@types"]
  });

  // Extra library
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    'export function next() : string { console.log("wow!")',
    'node_modules/@types/external/index.d.ts'
  );

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  });

  const editor = monaco.editor.create(document.getElementById('container'), {
    model: monaco.editor.createModel([
      'import {next} from "external/index"',
      'class abc {}',
      'let r: number = new abc() + next();'
    ].join('\n'), 'typescript', new monaco.Uri("model+abc"))
  });

  model = editor.model;

});

function runner() {
  monaco.languages.typescript.getTypeScriptWorker()
    .then((worker) => worker(model.uri))
    .then((client) => client.getEmitOutput(model.uri.toString()))
    .then((r) => {
      console.log(r);
    });
}

