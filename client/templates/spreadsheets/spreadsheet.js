Template.spreadsheet.rendered = function() {
  var spreadsheetObject = this.data;
  var spreadjs;

  var sendKeepAlive = function() {
    Meteor.call("keepalive", Spreadsheets.findOne()._id);
  }

  var refreshId = Meteor.setInterval(function() {
    sendKeepAlive();
  }, 5000);

  sendKeepAlive();

  Session.set("refreshId", refreshId);

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
    });

    spreadjs.bind($.wijmo.wijspread.Events.ActiveSheetChanged, function(e, info) {
      if (nbSheets < spreadjs.getSheetCount()) {
        nbSheets++;
        var activeCell = {
          col: 0,
          row: 0
        };
        tabActiveCell.push(activeCell);
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