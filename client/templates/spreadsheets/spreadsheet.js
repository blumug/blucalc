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

  var activeCol = 1;
  var activeRow = 1;

  var monitorCellChange = function() {
    var activeSheet = spreadjs.getActiveSheet();
    activeSheet.allowCellOverflow(true);

    spreadjs.bind($.wijmo.wijspread.Events.CellChanged, function(e, info) {
      spreadsheetObject.data = spreadjs.toJSON();
      Meteor.defer(function() {
        Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {});
      });
    });

    activeSheet.bind($.wijmo.wijspread.Events.SelectionChanged, function(e, info) {
      activeRow = activeSheet.getActiveRowIndex();
      activeCol = activeSheet.getActiveColumnIndex();
    });

    activeSheet.bind($.wijmo.wijspread.Events.ActiveSheetChanged, function(e, info) {
      spreadsheetObject.data = spreadjs.toJSON();
      Meteor.defer(function() {
        Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {});
      });
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
      var activeSheet = spreadjs.getActiveSheet();
      activeSheet.setActiveCell(activeRow, activeCol);
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