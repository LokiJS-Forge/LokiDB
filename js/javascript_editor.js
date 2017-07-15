/* global $ */

"use strict";

class JavascriptEditor {
  constructor(source) {
    this._view = source;
    this._parent = this._view.parent();

    // Buttons in view mode.
    this._view_controll = $('<div />');
    let edit_btn = $('<input />', {
      type: 'button',
      class: 'jse-button',
      value: 'Run this code',
      on: {
        click: () => {
          this.switchToEditMode();
        }
      }
    });
    this._view_controll.append(edit_btn);
    this._parent.prepend(this._view_controll);

    // Buttons in edit mode.
    this._edit_controll = $('<div />');
    let run_btn = $('<input />', {
      type: 'button',
      class: 'jse-button',
      value: 'Run',
      on: {
        click: () => {
          this.compile();
        }
      }
    });
    let exit_btn = $('<input />', {
      type: 'button',
      class: 'jse-button',
      value: 'Exit',
      on: {
        click: () => {
          this.switchToViewMode();
        }
      }
    });
    this._edit_controll.append(run_btn);
    this._edit_controll.append(exit_btn);
    this._parent.prepend(this._edit_controll);

    // Editor in edit mode.
    this._editor = $('<div />', {
      class: 'jse-editor',
    });
    this._parent.append(this._editor);

    // Create code mirror.
    this._editor_window = CodeMirror(this._editor[0], {
      mode: "javascript",
      lineNumbers: true,
      matchBrackets: true,
      tabSize: 2,
      //readOnly: true,
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
    this._output = $('<div />', {
      class: 'jse-output',
    });
    this._editor.append(this._output);

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
    this._edit_controll.children('input').each(function () {
      $(this).attr("disabled", true);
    });

    // Hook console log and error.
    const console_log = console.log;
    const console_error = console.error;

    let results = [];
    console.log = function () {
      let result = {
        type: "log",
        value: ""
      };
      for (let i = 0; i < arguments.length; i++) {
        result.value += JavascriptEditor.stringify(arguments[i]) + " ";
      }
      results.push(result);
    };
    console.error = function () {
      let result = {
        type: "error",
        value: ""
      };
      for (let i = 0; i < arguments.length; i++) {
        result.value += JavascriptEditor.stringify(arguments[i]) + " ";
      }
      results.push(result);
    };

    // Run code.
    try {
      eval(this._editor_window.getValue());
    } catch (e) {
      console.error(e);
    }

    // Disable hook.
    console.log = console_log;
    console.error = console_error;

    // Put log results into output window.
    for (let i = 0; i < results.length; i++) {
      let result = results[i];
      if (result.type === 'log') {
        this._output.append($('<span />', {
          class: 'jse-output-log',
          text: result.value
        }));
      } else {
        this._output.append($('<span />', {
          class: 'jse-output-error',
          text: result.value
        }));
      }
    }

    // Enable buttons.
    this._edit_controll.children('input').each(function () {
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
      return "" + value;
    }
    return '{' + Object.keys(value).map(key => `${key}: ${JavascriptEditor.stringify(value[key])}`).join(",") + "}";
  }
}

$('document').ready(function () {
  // Iterate over each javascript code block.
  $('code.javascript').each(function () {
    let code_block = $(this);
    let html = code_block.html();
    // Check if code block should be runnable.
    if (html.indexOf("// Runnable code") === 0) {
      code_block.html(html.slice(17));
      new JavascriptEditor(code_block);
    }
  });
});
