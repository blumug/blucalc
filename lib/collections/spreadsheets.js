Spreadsheets = new Mongo.Collection('spreadsheets');

Spreadsheets.allow({
  insert: function(userId, doc) {
    return doc;
  },

  remove: function(userId, doc) {
    return doc;
  },

  update: function(userId, doc) {
    return doc;
  }
});

Meteor.methods({
  'spreadsheetUpdate': function(spreadsheet) {
    if (Meteor.isServer) {
      Spreadsheets.update({
        _id: spreadsheet._id
      }, {
        $set: _.omit(spreadsheet, '_id', 'name', 'users')
      });
    }
  },

  'spreadsheetUpdateName': function(spreadsheet) {
    if (Meteor.isServer) {
      Spreadsheets.update({
        _id: spreadsheet._id
      }, {
        $set: _.omit(spreadsheet, '_id', 'data', 'users')
      });
    }
  },

  'changeSelection': function(id, selection, spreadsheet) {
    if (Meteor.isServer) {
      var users = spreadsheet.users;

      for (var i = users.length - 1; i >= 0; i--) {
        if (users[i].userId == id) {
          spreadsheet.users[i].selection = selection[0];
        }
      };

      Spreadsheets.update({
        _id: spreadsheet._id
      }, {
        $set: {
          users: spreadsheet.users
        }
      });
    }
  },

  'keepalive': function(id) {

    if (Meteor.user()) {
      var bool = true;
      var user = {
        now: (new Date()).getTime(),
        status: true,
        userId: Meteor.userId(),
        color: randomColor(),
        email: Meteor.user().emails[0].address
      };

      var elemMatch = Spreadsheets.findOne({
        _id: id
      });

      if (elemMatch) {
        if (!elemMatch.users) {
          elemMatch.users = [];
        }
        for (var i = elemMatch.users.length - 1; i >= 0; i--) {
          if (elemMatch.users[i].userId == Meteor.userId()) {
            bool = false;
            elemMatch.users[i].now = (new Date()).getTime();
          }
        }
      }

      if (bool == true) {
        Spreadsheets.update({
          _id: id
        }, {
          $push: {
            users: user
          }
        });
      } else {
        Spreadsheets.update({
          _id: id
        }, {
          $set: {
            users: elemMatch.users
          }
        });
      }
    }
  },

  'isNotalive': function(id) {
    Spreadsheets.update({
      _id: id
    }, {
      $pull: {
        $or: [        users: {
          userId: Meteor.userId()
        },
        {
          
        }

        ]
      }
    }, {
      multi: true
    });
  }
});