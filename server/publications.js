Meteor.publish('spreadsheets', function () {
  return Spreadsheets.find()
});


Meteor.publish('spreadsheet', function(id) {
  check(id, String);
  return Spreadsheets.find(id);
});
