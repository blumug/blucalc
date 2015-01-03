Template.spreadsheet.rendered = function() {
  console.log("rendered")
  var spreadsheetObject = this.data;
  var spreadjs;

  $("#grid").css({
    height: window.innerHeight - $(".navbar-jbl42").height()  - $(".spread-header").height()  - 16,
    width: '100%'
  }).wijspread({
    sheetCount: 1
  });

  $(window).resize(function() {
    $("#grid").css({
      height: window.innerHeight - $(".navbar-jbl42").height()  - $(".spread-header").height()  - 16,
      width: '100%'
    });
  });

  spreadjs = $("#grid").wijspread("spread");
  spreadjs.useWijmoTheme = true;
  spreadjs.repaint();

  if (spreadsheetObject.data) {
    spreadjs.fromJSON(spreadsheetObject.data);
  }
  var activeSheet = spreadjs.sheets[0];

  activeSheet.bind($.wijmo.wijspread.Events.CellChanged, function(e, info) {
    spreadsheetObject.data = spreadjs.toJSON();
    Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {
      console.log(result);
    });
  });
};

Template.spreadsheet.helpers({
  data: function () {
    if (!Template.instance().view.isRendered) {
      return;
    }
    console.log("Data")
    var spreadsheetObject = this;
    var spreadjs = $("#grid").wijspread("spread");    

    if (spreadsheetObject.data) {
      spreadjs.fromJSON(spreadsheetObject.data);
    }
    var activeSheet = spreadjs.sheets[0];

    activeSheet.bind($.wijmo.wijspread.Events.CellChanged, function(e, info) {
      spreadsheetObject.data = spreadjs.toJSON();
      Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {
        console.log(result);
      });
    });

  }
});