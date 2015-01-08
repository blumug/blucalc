Template.spreadsheets.events({
  'click .new': function() {
    bootbox.prompt("Spreadsheet name", function(result) {
      if (result) {
        Spreadsheets.insert({
          'name': result,
          'userId': Meteor.userId(),
          'tags': []
        });
      }
    });
  }
});

Template.spreadsheets.helpers({
  spreadsheets: function() {
    var filter = Template.instance().filter.get();

    if (filter && filter != "") {
      return Spreadsheets.find({
        $or: [{
          userId: this.userId
        }],
        $or: [{
          name: {
            $regex: filter,
            $options: "si"
          }
        }, {
          tags: {
            $regex: filter,
            $options: "si"
          }
        }]
      });
    } else {
      return Spreadsheets.find();
    }
  }
});