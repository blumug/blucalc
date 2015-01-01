Template.spreadsheet.rendered = function() {

    $("#grid").css({
        height: 400,
        width: '100%'
    }).wijspread({
        sheetCount: 1
    });

    $(window).resize(function() {
        $("#grid").css({
            height: '100%',
            width: '100%'
        });
    });

  var spreadjs = $("#grid").wijspread("spread");
  spreadjs.useWijmoTheme = true;
  spreadjs.repaint();
};