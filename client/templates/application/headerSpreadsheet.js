Template.headerSpreadsheet.events({
  'click .new': function() {
    bootbox.prompt("Spreadsheet name", function(result) {
      if (result) {
        Spreadsheets.insert({
          'name': result,
          'userId': Meteor.userId(),
          'group': [],
          'usersOnline': []
        });
      }
    });
  },

  'input #tagSearch': function(e, tmp) {
    Session.set("searchBar", $("#tagSearch").val());
  },

  'click .btn-edit-name': function() {
    bootbox.prompt({
      title: "Spreadsheet name",
      value: this.name,
      callback: function(result) {
        if (result) {
          var spreadsheets = Spreadsheets.find().fetch();

          spreadsheets[0].name = result;
          Meteor.call("spreadsheetUpdate", spreadsheets[0]);
        }
      }
    });
  }
});

Template.headerSpreadsheet.helpers({
  'userOnline': function() {
    if (Spreadsheets.find().count() > 0) {
      var usersOnline = Spreadsheets.find().fetch()[0].usersOnline;
      return usersOnline;
    }
  }
})