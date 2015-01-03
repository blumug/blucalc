Template.spreadsheet.rendered = function() {
  var spreadsheetObject = this.data;
  var spreadjs;

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

  spreadjs = $("#grid").wijspread("spread");
  spreadjs.useWijmoTheme = true;
  spreadjs.repaint();

  if (spreadsheetObject.data) {
    spreadjs.fromJSON(spreadsheetObject.data);
  }

  var activeCol = 1;
  var activeRow = 1;
  
//  spreadjs.getActiveSheet().getCells(1, 1, 2, 2).backColor("#CCCCFF"); 

  var monitorCellChange = function () {
    var activeSheet = spreadjs.getActiveSheet();

    activeSheet.bind($.wijmo.wijspread.Events.CellChanged, function(e, info) {
      console.log("cellchanged")
      spreadsheetObject.data = spreadjs.toJSON();
      Meteor.defer(function () {
        Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {});
      });
    }); 

    activeSheet.bind($.wijmo.wijspread.Events.SelectionChanged, function (e, info) {    
      // store cursor
      activeRow = activeSheet.getActiveRowIndex();
      activeCol = activeSheet.getActiveColumnIndex();
    });    
  }
  monitorCellChange();

  Spreadsheets.find({_id: this.data._id}).observe({
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
  })
};


Template.spreadsheet.events({
  'click .btn-currency': function (e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var activeRow = activeSheet.getActiveRowIndex();
    var activeCol = activeSheet.getActiveColumnIndex();

    activeSheet.getCell(activeRow, activeCol).formatter("#,##0.00 €");
  },

  'click .btn-general': function (e) {
    e.preventDefault()
    var spreadjs = $("#grid").wijspread("spread");
    var activeSheet = spreadjs.getActiveSheet();
    var activeRow = activeSheet.getActiveRowIndex();
    var activeCol = activeSheet.getActiveColumnIndex();

    activeSheet.getCell(activeRow, activeCol).formatter("General");

    var spreadsheetObject = this;
    spreadsheetObject.data = spreadjs.toJSON();
    Meteor.defer(function () {
      Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {});
    });


  }

});