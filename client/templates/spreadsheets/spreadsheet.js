Template.spreadsheet.rendered = function() {
  var spreadsheetObject = this.data;
  var spreadjs;

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

  var monitorCellChange = function () {
    var activeSheet = spreadjs.sheets[0];
    activeSheet.bind($.wijmo.wijspread.Events.CellChanged, function(e, info) {
      spreadsheetObject.data = spreadjs.toJSON();
      Meteor.call('spreadsheetUpdate', spreadsheetObject, function(error, result) {});
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
        var activeSheet = spreadjs.sheets[0]; 
        activeSheet.setActiveCell(activeRow, activeCol);
        monitorCellChange();
      }
    }
  })

};
