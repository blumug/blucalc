Template.header.events({
  'click .new': function() {
    bootbox.prompt("Spreadsheet name", function(result) {
      if (result) {
        var id = Spreadsheets.insert({
          'name': result,
          'userId': Meteor.userId(),
          'group': [],
          'usersOnline': []
        });
        Router.go('/spreadsheets/' + id);
      }
    });
  }
});
