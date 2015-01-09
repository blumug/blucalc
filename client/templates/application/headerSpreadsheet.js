Template.headerSpreadsheet.events({
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
          Meteor.call("spreadsheetUpdateName", spreadsheets[0]);
        }
      }
    });
  }
});

Template.headerSpreadsheet.helpers({
  'userOnline': function() {
    var usersOnline = []
    if (Spreadsheets.find().count() > 0) {
      usersOnline = Spreadsheets.find().fetch()[0].users;
    }

    for (var i = usersOnline.length - 1; i >= 0; i--) {
      if (usersOnline[i].status == false) {
        usersOnline.splice(i, 1);
      }
    };

    return usersOnline;
  }
});