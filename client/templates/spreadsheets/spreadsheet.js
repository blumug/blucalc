Template.spreadsheet.rendered = function() {
  var spreadsheetObject = this.data;
  var spreadjs;

  var sendKeepAlive = function () {
    var spreadsheet = Spreadsheets.find().fetch()[0];
    Meteor.call("keepalive", spreadsheet._id);
  }

  var refreshId = Meteor.setInterval(function() {
    sendKeepAlive();
  }, 5000);

  sendKeepAlive();

  Session.set("refreshId", refreshId);


  $.wijmo.wijspread.Culture("en-US");

  $("#grid").css({
    height: window.innerHeight - $(".navbar-jbl42").height() - $(".spread-header").height() - 16,
    width: '100%'
  }).wijspread({
    sheetCount: 1
  });

  $(window).resize(function() {
    $("#grid").css({
      height: window.innerHeight - $(".navbar-jbl42").height() - $(".spread-header").height() - 16,
      width: '100%'
    });
  });

  $("#gridvp").click(function() {
    setBackgroundColor(Meteor.user(), spreadsheetObject);
    var selectedRanges = $("#grid").wijspread("spread").getActiveSheet().getSelections().toArray();
  });

  spreadjs = $("#grid").wijspread("spread");
  spreadjs.useWijmoTheme = true;
  spreadjs.repaint();
  setBackgroundColor(Meteor.user(), spreadsheetObject);

  if (spreadsheetObject.data) {
    spreadjs.fromJSON(spreadsheetObject.data);
  }

  var activeCol = 1;
  var activeRow = 1;


  var monitorCellChange = function() {
    var activeSheet = spreadjs.getActiveSheet();

    activeSheet.bind($.wijmo.wijspread.Events.CellChanged, function(e, info) {
      console.log("cellchanged")
      spreadsheetObject.data = spreadjs.toJSON();
      Meteor.defer(function() {
        Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {});
      });
    });

    activeSheet.bind($.wijmo.wijspread.Events.SelectionChanged, function(e, info) {
      activeRow = activeSheet.getActiveRowIndex();
      activeCol = activeSheet.getActiveColumnIndex();
    });
  };

  monitorCellChange();

  Spreadsheets.find({
    _id: this.data._id
  }).observe({
    changed: function(newDocument, oldDocument) {
      if (newDocument.data) {
        var spreadjs = $("#grid").wijspread("spread");
        spreadjs.fromJSON(newDocument.data);
        spreadjs.repaint();
        var activeSheet = spreadjs.sheets[0];
        activeSheet.setActiveCell(activeRow, activeCol);
        monitorCellChange();
      }
    }
  });
};

var setBackgroundColor = function(user, spreadsheet) {
  var spread = $("#grid").wijspread("spread");
  var sheet = spread.getActiveSheet();
  var backColor = "#FFFFFF";
  if (user) {
    for (var i = spreadsheet.users.length - 1; i >= 0; i--) {
      if (spreadsheet.users[i].userId == user._id) {
        backColor = spreadsheet.users[i].color;
      }
    };
  }
  sheet.selectionBackColor(backColor);
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