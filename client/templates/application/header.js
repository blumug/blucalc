Template.header.events({
  'click .new': function () {
    bootbox.prompt("Spreadsheet name", function(result) {                
      if (result) {                                             
        Spreadsheets.insert({'name': result, 'userId': Meteor.userId()});
      }
    });
  }
});