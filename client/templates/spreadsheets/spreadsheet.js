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
    height: window.innerHeight - $(".navbar-jbl42").height() - $(".spread-header").height() - $("#formulaBar").height() - 16,
    width: '100%'
  }).wijspread({
    sheetCount: 1
  });

  $(window).resize(function() {
    $("#grid").css({
      height: window.innerHeight - $(".navbar-jbl42").height() - $(".spread-header").height() - $("#formulaBar").height() - 16,
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
            activeSheet.getCell(y, x).backColor($(".color-background").val());
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
            activeSheet.getCell(y, x).foreColor($(".color-foreground").val());
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
    var style = activeSheet.getDefaultStyle(activeSheet);

      for (var i = selections.length - 1; i >= 0; i--) {

        for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
          for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
            activeSheet.getCell(y, x).hAlign($.wijmo.wijspread.HorizontalAlign.left);
          };
        };

      };
  },

  'click .btn-align-right': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();
    var style = activeSheet.getDefaultStyle(activeSheet);

      for (var i = selections.length - 1; i >= 0; i--) {

        for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
          for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
            activeSheet.getCell(y, x).hAlign($.wijmo.wijspread.HorizontalAlign.right);
          };
        };

      };
  },

  'click .btn-align-center': function(e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var selections = activeSheet.getSelections();
    var style = activeSheet.getDefaultStyle(activeSheet);

      for (var i = selections.length - 1; i >= 0; i--) {

        for (var y = selections[i].row; y <= selections[i].row + selections[i].rowCount - 1; y++) {
          for (var x = selections[i].col; x <= selections[i].col + selections[i].colCount - 1; x++) {
            activeSheet.getCell(y, x).hAlign($.wijmo.wijspread.HorizontalAlign.center);
          };
        };

      };
  }

});