Template.header.events({
  'click .new': function() {
    bootbox.prompt("Spreadsheet name", function(result) {
      if (result) {
        Spreadsheets.insert({
          'name': result,
          'userId': Meteor.userId(),
          'group': []
        });
      }
    });
  },

  'input #tagSearch': function(e, tmp) {
  	Session.set("searchBar", $("#tagSearch").val());
  }
});