Template.headerSpreadsheet.events({
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
  },

  'click .btn-edit-name': function() {
    bootbox.prompt("Spreadsheet name", function(result) {
      if (result) {
        var spreadsheets = Spreadsheets.find().fetch();

        spreadsheets[0].name = result;
        Meteor.call("spreadsheetUpdate", spreadsheets[0]);
      }
    });
  }
});

Template.headerSpreadsheet.helpers({
  'title': function() {
    if (Spreadsheets.find().count() != 0) {
      var spreadsheets = Spreadsheets.find().fetch();
      return spreadsheets[0].name + " ..";
    } else {
      return "";
    }
  },

  'userOnline': function() {
    return Meteor.users.find({"status.online" : true});
  },

  'color': function() {
    return randomColor();
  }
})