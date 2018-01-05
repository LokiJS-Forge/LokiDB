/* global $ */

"use strict";

// Needed to use onclick function.
const $$EDITORS = [];

function switchToEditMode(pos) {
  $$EDITORS[pos - 1].switchToEditMode();
}

class JavascriptEditor {
  constructor(source) {
    const pos = $$EDITORS.push(this);

    this._view = source;
    this._parent = this._view.parent();

    // Buttons in view mode.
    this._view_controll = $("<div />", {
      style: "position: absolute;top:0;right:0;z-index:10;",
    });
    let edit_btn = $("<input />", {
      type: "button",
      class: "btn btn-info jse-button",
      value: "Run this code!",
      onclick: "switchToEditMode(" + pos + ");"
    });
    this._view_controll.append(edit_btn);
    const wrapped_view = this._parent.children().first().wrap($("<div />", {
      style: "position:relative;",
    }));
    wrapped_view.append(this._view_controll);


    // Buttons in edit mode.
    this._edit_controll = $("<div />", {
      style: "position: absolute;top:0;right:0;z-index:10;",
    });
    let run_btn = $("<input />", {
      type: "button",
      class: "btn btn-info jse-button",
      value: "Run",
      on: {
        click: () => {
          this.compile();
        }
      }
    });
    let exit_btn = $("<input />", {
      type: "button",
      class: "btn btn-neutral jse-button",
      value: "Exit",
      on: {
        click: () => {
          this.switchToViewMode();
        }
      }
    });
    this._edit_controll.append(run_btn);
    this._edit_controll.append(exit_btn);
    // this._parent.prepend(this._edit_controll);

    // Editor in edit mode.
    this._editor = $("<div />", {
      class: "jse-editor",
    });
    this._parent.append(this._editor);

    // Create code mirror.
    this._editor_window = CodeMirror(this._editor[0], {
      mode: "javascript",
      lineNumbers: true,
      matchBrackets: true,
      tabSize: 2,
      extraKeys: {
        "Tab": function (cm) {
          const spaces = new Array(cm.getOption("indentUnit") + 1).join(" ");
          cm.replaceSelection(spaces);
        }
      },
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    });

    // Add output window
    this._output = $("<div />", {
      class: "jse-output",
    });
    this._editor.append(this._output);
    this._editor.append(this._edit_controll);

    this.switchToViewMode();
  }

  switchToViewMode() {
    this._edit_controll.hide();
    this._view_controll.show();
    this._editor_window.setValue(this._view.text());
    this._editor.hide();
    this._view.show();
  }

  switchToEditMode() {
    this._view_controll.hide();
    this._edit_controll.show();
    this._view.hide();
    this._editor.show();
    this.compile();
  }

  compile() {
    // Clear output window and disable buttons.
    this._output.empty();
    this._edit_controll.children("input").each(function () {
      $(this).attr("disabled", true);
    });

    // Collection of cout and cerr.
    let results = [];

    // Hook cout and cerr.
    let hook = `
    function cout() {
      console.log.apply(this, arguments);
      let result = "";
      for (let i = 0; i < arguments.length; i++) {
        result += JavascriptEditor.stringify(arguments[i]) + " ";
      }
      $__output$.append($("<span />", {
        class: "jse-output-log",
        text: result
      }));
    };
    
    function cerr() {
      console.error.apply(this, arguments);
      let result = "";
      for (let i = 0; i < arguments.length; i++) {
        result += JavascriptEditor.stringify(arguments[i]) + " ";
      }
      $__output$.append($("<span />", {
          class: "jse-output-error",
          text: result
      }));
    };`;

    // Run code.
    try {
      eval("(($__output$) => {" + hook + this._editor_window.getValue() + "})")(this._output);
    } catch (e) {
      console.error(e);
      this._output.append($("<span />", {
        class: "jse-output-error",
        text: String(e)
      }));
    }

    // Enable buttons.
    this._edit_controll.children("input").each(function () {
      $(this).removeAttr("disabled");
    });
  }

  static stringify(value) {
    const type = Object.prototype.toString.call(value);
    if (type === "[object Array]") {
      let ret = "[";
      for (let i = 0; i < value.length; i++) {
        ret += JavascriptEditor.stringify(value[i]) + ", ";
      }
      if (ret.length !== 1) {
        ret = ret.slice(0, -2);
      }
      return ret + "]";
    }
    if (type !== "[object Object]") {
      return String(value);
    }
    return "{" + Object.keys(value).map(key => `${key}: ${JavascriptEditor.stringify(value[key])}`).join(",") + "}";
  }
}

$("document").ready(function () {
  // Iterate over each javascript code block.
  $("code.javascript").each(function () {
    let code_block = $(this);
    let html = code_block.html();
    // Check if code block should be runnable.
    if (html.indexOf("// Runnable code") === 0) {
      code_block.html(html.slice(17));
      new JavascriptEditor(code_block);
    }
  });
});
