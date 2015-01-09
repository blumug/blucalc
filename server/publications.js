Meteor.publish('spreadsheets', function () {
  return Spreadsheets.find()
});


Meteor.publish('spreadsheet', function(id) {
  check(id, String);
  return Spreadsheets.find({ _id: id });
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