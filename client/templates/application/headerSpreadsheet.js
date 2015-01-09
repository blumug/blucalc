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
    return Meteor.users.find({"status.online" : true});
  },

  'color': function() {
    var user = Meteor.user();
    if (!user.profile.color) {
      Meteor.users.update({ _id: user._id }, { $set: { "profile.color": randomColor() } });
    }
    return user.profile.color;
  },

  'email': function() {
    return this.emails[0].address.substr(0, 3).toUpperCase();
  }
})