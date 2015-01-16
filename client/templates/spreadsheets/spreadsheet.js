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

var cleanOldSelection = function(cells) {
  var sheet = $("#grid").wijspread("spread").getActiveSheet();
  var ns = $.wijmo.wijspread;
  var cell;

  for (var y = cells[0].row; y < cells[0].rowCount + cells[0].row; y++) {
    for (var x = cells[0].col; x < cells[0].colCount + cells[0].col; x++) {
      cell = sheet.getCell(y, x);

      if (x == cells[0].col) {
        cell.clearStyleProperty("borderLeft");        
      }
      if (y == cells[0].row) {
        cell.clearStyleProperty("borderTop");        
      }
      if (x == cells[0].colCount + cells[0].col - 1) {
        cell.clearStyleProperty("borderRight");
      }
      if (y == cells[0].rowCount + cells[0].row - 1) {
        cell.clearStyleProperty("borderBottom");
      }
    };
  };
};

var printSelection = function(cells) {
  var sheet = $("#grid").wijspread("spread").getActiveSheet();
  var ns = $.wijmo.wijspread;
  var color = getColorUser();
  var cell;

  for (var y = cells[0].row; y < cells[0].rowCount + cells[0].row; y++) {
    for (var x = cells[0].col; x < cells[0].colCount + cells[0].col; x++) {
      cell = sheet.getCell(y, x);

      if (x == cells[0].col) {
        cell.borderLeft(new ns.LineBorder(color, ns.LineStyle.thick));        
      }
      if (y == cells[0].row) {
        cell.borderTop(new ns.LineBorder(color, ns.LineStyle.thick));
      }
      if (x == cells[0].colCount + cells[0].col - 1) {
        cell.borderRight(new ns.LineBorder(color, ns.LineStyle.thick));
      }
      if (y == cells[0].rowCount + cells[0].row - 1) {
        cell.borderBottom(new ns.LineBorder(color, ns.LineStyle.thick));
      }
    };
  };
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
  var fbx = new $.wijmo.wijspread.FormulaTextBox(document.getElementById('formulaBar'));
  fbx.spread(spreadjs);

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

      if (Session.get("activeSelection")) {
        cleanOldSelection(Session.get("activeSelection"));
      }
      Session.set("activeSelection", activeSheet.getSelections());
      printSelection(activeSheet.getSelections());
      Meteor.call("changeSelection", Meteor.userId(), activeSheet.getSelections(), spreadsheetObject);
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
      spreadjs.unbindAll();
      spreadjs.fromJSON(fields.data);
      spreadjs.repaint();
      spreadjs.setActiveSheetIndex(activeSheetIndex);
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
    spreadsheetObject.data = spreadjs.toJSON();
    Meteor.defer(function() {
      Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {});
    });
  },

  'click .btn-invite': function(e) {
    e.preventDefault()
    bootbox.prompt("Invite friend", function(result) {
      if (result) {
        var spreadsheet = Spreadsheets.find().fetch();
        Meteor.call("addUserToGroup", spreadsheet[0], result);
      }
    });
  }

});