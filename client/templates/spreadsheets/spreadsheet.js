var formulaBar;

var sendKeepAlive = function() {
  Meteor.defer(function() {
    Meteor.call("keepalive", Spreadsheets.findOne()._id);
  });
};

var initKeepAlive = function() {
  sendKeepAlive();
  var refreshId = Meteor.setInterval(function() {
    sendKeepAlive();
  }, 5000);

  Session.set("refreshId", refreshId);
};

var getColorUser = function() {
  var spreadsheetObject = Spreadsheets.findOne();
  for (var i = spreadsheetObject.users.length - 1; i >= 0; i--) {
    if (spreadsheetObject.users[i].userId == Meteor.userId()) {
      return spreadsheetObject.users[i].color;
    }
  };
  return "black";
};

var initWindows = function() {
  var spreadjs;

  $.wijmo.wijspread.Culture("en-US");
  $("#grid").css({
    height: $(window).height() - $(".navbar-jbl42").height() - $(".spread-header-container").height() - 32,
    width: '100%'
  }).wijspread({
    sheetCount: 1
  });

  $(window).resize(function() {
    $("#grid").css({
      height: $(window).height() - $(".navbar-jbl42").height() - $(".spread-header-container").height() - 32,
      width: '100%'
    });
  });

  spreadjs = $("#grid").wijspread("spread");
  spreadjs.useWijmoTheme = true;
  spreadjs.repaint();
};


Template.spreadsheet.rendered = function() {
  var spreadsheetObject = this.data;
  var spreadjs;

  initKeepAlive();
  initWindows();

  $("#custom-background").spectrum({
    color: "#f00"
  });
  $("#custom-foreground").spectrum({
    color: "#f00"
  });
  spreadjs = $("#grid").wijspread("spread");
  if (spreadsheetObject.data) {
    spreadjs.fromJSON(spreadsheetObject.data);
  }
  formulaBar = new $.wijmo.wijspread.FormulaTextBox(document.getElementById('formulaBar'));
  formulaBar.spread(spreadjs);

  var nbSheets = spreadjs.getSheetCount();
  var tabActiveCell = [];

  for (var i = 0; i < nbSheets; i++) {
    var activeCell = {
      col: 0,
      row: 0
    };
    tabActiveCell.push(activeCell);
  }
  var activeSheetIndex = spreadjs.getActiveSheetIndex();
  var activeSheet = spreadjs.getActiveSheet();
  var monitorCellChange = function() {
    activeSheet = spreadjs.getActiveSheet();
    activeSheet.allowCellOverflow(true);

    spreadjs.bind($.wijmo.wijspread.Events.CellChanged, function(e, info) {
      spreadsheetObject = Spreadsheets.findOne();
      activeSheet.setDefaultStyle(activeSheet.getDefaultStyle());
      spreadjs = $("#grid").wijspread("spread");
      spreadsheetObject.data = spreadjs.toJSON();
      Meteor.defer(function() {
        Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {});
      });
    });

    spreadjs.bind($.wijmo.wijspread.Events.SelectionChanged, function(e, info) {
      activeSheetIndex = spreadjs.getActiveSheetIndex();
      activeSheet = spreadjs.getActiveSheet();
      tabActiveCell[activeSheetIndex].row = activeSheet.getActiveRowIndex();
      tabActiveCell[activeSheetIndex].col = activeSheet.getActiveColumnIndex();
    });

    spreadjs.bind($.wijmo.wijspread.Events.ActiveSheetChanged, function(e, info) {
      if (nbSheets < spreadjs.getSheetCount()) {
        for (var i = nbSheets; i < spreadjs.getSheetCount(); i++) {
          var activeCell = {
            col: 0,
            row: 0
          };
          nbSheets++;
          tabActiveCell.push(activeCell);
        }
      }
    });
  };

  monitorCellChange();

  Spreadsheets.find({
    _id: this.data._id
  }).observeChanges({
    changed: function(id, fields) {
      if (!fields.data) {
        return;
      }
      var spreadjs = $("#grid").wijspread("spread");
      if (!spreadjs) {
        return;
      }
      spreadsheetObject = Spreadsheets.findOne();
      spreadjs.unbindAll();
      spreadjs.fromJSON(fields.data);
      spreadjs.repaint();
      spreadjs.setActiveSheetIndex(activeSheetIndex);
      formulaBar.spread(spreadjs);
      activeSheet = spreadjs.getActiveSheet();
      activeSheet.setActiveCell(tabActiveCell[activeSheetIndex].row, tabActiveCell[activeSheetIndex].col);
      monitorCellChange();
    }
  });
};

Template.spreadsheet.events({
  'click .btn-currency': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var activeRow = activeSheet.getActiveRowIndex();
    var activeCol = activeSheet.getActiveColumnIndex();

    activeSheet.getCell(activeRow, activeCol).formatter("#,##0.00 €");
  },

  'click .btn-general': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var activeRow = activeSheet.getActiveRowIndex();
    var activeCol = activeSheet.getActiveColumnIndex();

    activeSheet.getCell(activeRow, activeCol).formatter("General");

    var spreadsheetObject = this;
    HideUsers(spreadsheetObject.users);
    spreadsheetObject.data = spreadjs.toJSON();
    Meteor.defer(function() {
      Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {});
    });
  },

  'click .btn-background-color': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();

    activeSheet.isPaintSuspended(true);

    for (var i = selections.length - 1; i >= 0; i--) {

      for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
        for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
          activeSheet.getCell(y, x).backColor("#" + $("#custom-background").spectrum("get").toHex());
        };
      };

    };

    activeSheet.isPaintSuspended(false);
  },

  'click .btn-foreground-color': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();

    activeSheet.isPaintSuspended(true);

    for (var i = selections.length - 1; i >= 0; i--) {

      for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
        for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
          activeSheet.getCell(y, x).foreColor("#" + $("#custom-foreground").spectrum("get").toHex());
        };
      };

    };

    activeSheet.isPaintSuspended(false);
  },

  'click .btn-clear-style': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();
    var style = activeSheet.getDefaultStyle(activeSheet);

    for (var i = selections.length - 1; i >= 0; i--) {

      for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
        for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
          activeSheet.setStyle(y, x, style);
        };
      };

    };
  },

  'click .btn-align-left': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();

    forEachCell(selections, activeSheet, $.wijmo.wijspread.HorizontalAlign.left);
  },

  'click .btn-align-right': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();

    forEachCell(selections, activeSheet, $.wijmo.wijspread.HorizontalAlign.right);
  },

  'click .btn-align-center': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();

    forEachCell(selections, activeSheet, $.wijmo.wijspread.HorizontalAlign.center);
  },

  'click .btn-insert-col': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections()[0];

    activeSheet.addColumns(selections.col, 1);
  },

  'click .btn-insert-row': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections()[0];

    activeSheet.addRows(selections.row, 1);
  },

  'click .btn-remove-col': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections()[0];
    bootbox.dialog({
      message: "Do you want delete this Column(s)",
      title: "Warning",
      buttons: {
        main: {
          label: "Cancel",
          className: "btn-primary"
        },
        danger: {
          label: "Delete",
          className: "btn-danger",
          callback: function() {
            activeSheet.deleteColumns(selections.col, selections.colCount);
          }
        }
      }
    });
  },

  'click .btn-remove-row': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections()[0];

    bootbox.dialog({
      message: "Do you want delete this Row(s)",
      title: "Warning",
      buttons: {
        main: {
          label: "Cancel",
          className: "btn-primary"
        },
        danger: {
          label: "Delete",
          className: "btn-danger",
          callback: function() {
            activeSheet.deleteRows(selections.row, selections.rowCount);
          }
        }
      }
    });
  },

  'change .font-size': function(e) {
    e.preventDefault();
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();
    var result = "";
    var style;
    var font;

    var st = activeSheet.getStyle(0, 0);
    for (var i = selections.length - 1; i >= 0; i--) {
      for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
        for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
          style = activeSheet.getStyle(y, x);
          if (style != null) {
            font = style.font;
          }

          if (!font && font == undefined) {
            font = "";
          }

          if (font.indexOf("italic") != -1) {
            result += " italic";
          }

          if (font.indexOf("bold") == -1) {
            result += " bold";
          }

          result += " " + $(".font-size").val() + "px " + $(".font-police").val();
          activeSheet.getCell(y, x).font(result);
        };
      };
    };
  },

  'change .font-police': function(e) {
    e.preventDefault();
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();
    var result = "";
    var style;
    var font;

    var st = activeSheet.getStyle(0, 0);
    for (var i = selections.length - 1; i >= 0; i--) {
      for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
        for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
          style = activeSheet.getStyle(y, x);
          if (style != null) {
            font = style.font;
          }

          if (!font && font == undefined) {
            font = "";
          }

          if (font.indexOf("italic") != -1) {
            result += " italic";
          }

          if (font.indexOf("bold") == -1) {
            result += " bold";
          }

          result += " " + $(".font-size").val() + "px " + $(".font-police").val();
          activeSheet.getCell(y, x).font(result);
        };
      };
    };
  },

  'click .btn-bold': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();
    var result = "";
    var style;
    var font;

    var st = activeSheet.getStyle(0, 0);
    for (var i = selections.length - 1; i >= 0; i--) {
      for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
        for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
          style = activeSheet.getStyle(y, x);
          if (style != null) {
            font = style.font;
          }

          if (!font && font == undefined) {
            font = "";
          }

          if (font.indexOf("italic") != -1) {
            result += " italic";
          }

          if (font.indexOf("bold") == -1) {
            result += " bold";
          }

          result += " " + $(".font-size").val() + "px " + $(".font-police").val();
          activeSheet.getCell(y, x).font(result);
        };
      };
    };
  },

  'click .btn-italic': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();
    var style = activeSheet.getDefaultStyle(activeSheet);
    var result = "";

    var st = activeSheet.getStyle(0, 0);
    for (var i = selections.length - 1; i >= 0; i--) {
      for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
        for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
          style = activeSheet.getStyle(y, x);
          if (style != null) {
            font = style.font;
          }

          if (!font && font == undefined) {
            font = "";
          }

          if (font.indexOf("bold") != -1) {
            result += " bold";
          }

          if (font.indexOf("italic") == -1) {
            result += " italic";
          }

          result += " " + $(".font-size").val() + "px " + $(".font-police").val();
          activeSheet.getCell(y, x).font(result);
        };
      };
    };
  },

  'click .btn-span': function(e) {
    e.preventDefault();
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();
    var spans = activeSheet.getSpans();
    for (var i = selections.length - 1; i >= 0; i--) {
      activeSheet.addSpan(selections[i].row, selections[i].col, selections[i].rowCount, selections[i].colCount);
      for (var i = spans.length - 1; i >= 0; i--) {
        if (spans[i].row == selections[0].row && spans[i].col == selections[0].col) {
          activeSheet.removeSpan(spans[i].row, spans[i].col)
        }
      }
    }
  },

  'change .range-zoom': function(e, tmp) {
    e.preventDefault();
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();

    activeSheet.zoom($(".range-zoom").val() / 100);
  },

  'click .btn-export-pdf': function(e, tmp) {
    e.preventDefault();
    Blaze.saveAsPDF(Template.spreadsheet);
  }
});

var forEachCell = function(selections, activeSheet, arg) {
  for (var i = selections.length - 1; i >= 0; i--) {
    for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
      for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
        activeSheet.getCell(y, x).hAlign(arg);
      };
    };
  };
}
