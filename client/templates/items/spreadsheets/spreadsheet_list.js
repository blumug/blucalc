Template.spreadsheetList.helpers({
  'spreadsheetList': function() {
    var filter = Session.get("searchBar");

    if (filter && filter != "") {
      return Spreadsheets.find({
        userId: Meteor.userId(),
        name: {
          $regex: filter,
          $options: "i"
        }
      });
    } else {
      return Spreadsheets.find();
    }
  }
})