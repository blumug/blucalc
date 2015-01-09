Template.header.events({
  'click .new': function() {
    bootbox.prompt("Spreadsheet name", function(result) {
      if (result) {
        var id = Spreadsheets.insert({
          'name': result,
          'userId': Meteor.userId(),
          'group': [],
          'users': []
        });
        Router.go('/spreadsheets/' + id);
      }
    });
  },
  'input #tagSearch': function(e, tmp) {
    Session.set("searchBar", $("#tagSearch").val());
  }  
});
