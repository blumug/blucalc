Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});


Router.route('/', {
  name: 'spreadsheetList',
  waitOn: function() {
    return [Meteor.subscribe('spreadsheets')];
  },
  data: function() {
    return Spreadsheets.find();
  }
});

Router.route('/spreadsheets/:_id', {
  name: 'spreadsheet',
  waitOn: function() {
    return [Meteor.subscribe('spreadsheet', this.params._id)];
  },
  data: function() {
    return Spreadsheets.findOne(this.params._id);
  }
});
