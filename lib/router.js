Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    Meteor.subscribe('allUser');
  }
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
  layoutTemplate: 'layoutSpreadsheet',
  waitOn: function() {
    return [Meteor.subscribe('spreadsheet', this.params._id)];
  },

  data: function() {
    return Spreadsheets.findOne(this.params._id);
  },
  
  onStop: function() {
    var filterGroups = Session.get("refreshId");
    clearInterval(filterGroups);
    Meteor.call("isNotalive", this.params._id);
  }
});