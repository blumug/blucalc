Spreadsheets = new Mongo.Collection('spreadsheets');

Meteor.methods({
  'spreadsheetUpdate': function(spreadsheet) {
    Spreadsheets.update({
      _id: spreadsheet._id
    }, {
      $set: _.omit(spreadsheet, '_id')
    });
  }
});