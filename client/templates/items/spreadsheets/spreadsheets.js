Template.spreadsheets.events({
  'click .new': function () {
    bootbox.prompt("Spreadsheet name", function(result) {                
      if (result) {                                             
        Spreadsheets.insert({'name': result, 'userId': Meteor.userId()});
      }
    });
  }
});

Template.spreadsheets.helpers({
  spreadsheets: function () {
    return Spreadsheets.find();
  }
});