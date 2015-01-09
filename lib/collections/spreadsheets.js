Spreadsheets = new Mongo.Collection('spreadsheets');

Spreadsheets.allow({
  insert: function(userId, doc) {
    return doc && doc.userId === userId;
  },

  remove: function(userId, doc) {
    return doc && doc.userId === userId;
  },

  update: function(userId, doc) {
    return doc && doc.userId === userId;
  }
});

Meteor.methods({
  'spreadsheetUpdate': function(spreadsheet) {
    if (Meteor.isServer) {
      Spreadsheets.update({
        _id: spreadsheet._id
      }, {
        $set: _.omit(spreadsheet, '_id')
      });
    }
  },

  'keepalive': function(id) {
    var spreadsheet = Spreadsheets.findOne({
      _id: id
    });
    var user = Meteor.user();

    for (var i = spreadsheet.usersOnline.length - 1; i >= 0; i--) {
      if (spreadsheet.usersOnline[i].userId == user._id) {
        spreadsheet.usersOnline[i].status = true;
        spreadsheet.usersOnline[i].now = (new Date()).getTime();
      }
    }
    Meteor.call("spreadsheetUpdate", spreadsheet);
  },

  'isNotalive': function(id) {
    var spreadsheet = Spreadsheets.findOne({
      _id: id
    });
    var user = Meteor.user();

    for (var i = spreadsheet.usersOnline.length - 1; i >= 0; i--) {
      if (spreadsheet.usersOnline[i].userId == user._id) {
        spreadsheet.usersOnline[i].status = false;
      }
    }
    Meteor.call("spreadsheetUpdate", spreadsheet);
  }
});

if (Meteor.isServer) {
  Meteor.users.find({
    "status.online": true
  }).observe({
    added: function(user) {
      console.log("added " + user.emails[0].address);
      var spreadsheets = Spreadsheets.find().fetch();
      var color = randomColor();
      var now = (new Date()).getTime();
      var userId = user._id;
      var status = false;
      var email = user.emails[0].address;

      for (var i = spreadsheets.length - 1; i >= 0; i--) {
        var result = 0;
        for (var x = spreadsheets[i].usersOnline.length - 1; x >= 0; x--) {
          if (spreadsheets[i].usersOnline[x].userId == userId) {
            result++;
          }
        }
        if (result == 0) {
          spreadsheets[i].usersOnline.push({
            userId: userId,
            color: color,
            status: status,
            now: now,
            email: email
          });
          Meteor.call("spreadsheetUpdate", spreadsheets[i]);
        }
      }
    },

    removed: function(user) {
      console.log("removed " + user.emails[0].address);
      var spreadsheets = Spreadsheets.find({
        "usersOnline.userId": user._id
      }).fetch();

      for (var i = spreadsheets.length - 1; i >= 0; i--) {
        for (var x = spreadsheets[i].usersOnline.length - 1; x >= 0; x--) {
          if (spreadsheets[i].usersOnline[x].userId == user._id) {
            spreadsheets[i].usersOnline.splice(x, 1);
          }
        }
        Meteor.call("spreadsheetUpdate", spreadsheets[i]);
      }
    }
  });
}