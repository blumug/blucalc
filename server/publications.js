Meteor.publish('spreadsheets', function() {
  return Spreadsheets.find()
});


Meteor.publish('spreadsheet', function(id) {
  check(id, String);
  return Spreadsheets.find({
    _id: id
  });
});

Meteor.publish('allUser', function() {
  var options = {
    fields: {
      profile: 1,
      emails: 1,
      status: 1
    }
  };
  return Meteor.users.find({}, options);
});

Meteor.setInterval(function() {
  var now = (new Date()).getTime();

  if (Spreadsheets.find().count() > 0) {
    var spreadsheet = Spreadsheets.find().fetch()[0];
    for (var i = spreadsheet.usersOnline.length - 1; i >= 0; i--) {
      if (now - 10 * 1000 < spreadsheet.usersOnline[i].now) {
        Meteor.call("isNotalive", spreadsheet._id);
      }
    }
  }
}, 5000);