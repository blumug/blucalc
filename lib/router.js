Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    Meteor.subscribe('allUser');
  }
});


Router.route('/home', {
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
    Meteor.call("isNotalive", this.params._id);
    var filterGroups = Session.get("refreshId");
    clearInterval(filterGroups);
  }
});


Router.map(function() {
  this.route('landing', {
    path: '/',
    layoutTemplate: 'layoutLanding',
    onBeforeAction: function() {
      if (Meteor.user()) {
        Router.go('/home');
      }
      this.next();
    }

  });
});

Router.map(function() {
  this.route('pdf', {
    path: '/export-pdf/:_id',
    where: 'server',
    action: function() {
      var path = "id";
      var file = Spreadsheets.findOne({
        _id: this.params._id
      });;

      var headers = {
        'Content-type': 'application/json',
        'Content-Disposition': "attachment; filename=" + this.params._id + ".pdf"
      };

      this.response.writeHead(200, headers);
      return this.response.end(EJSON.stringify(_.omit(file, '_id')));
    }
  });
});

Router.map(function() {
  this.route('excel', {
    path: '/export-excel/:_id',
    where: 'server',
    action: function() {
      var path = "id";
      var file = Spreadsheets.findOne({
        _id: this.params._id
      });;

      var headers = {
        'Content-type': 'text/csv',
        'Content-Disposition': "attachment; filename=" + this.params._id + ".csv"
      };

      this.response.writeHead(200, headers);
      return this.response.end(EJSON.stringify(_.omit(file, '_id')));
    }
  });
});

Router.map(function() {
  this.route('passwordRecovery', {
    layoutTemplate: 'layoutRecovery'
  });
});


Router.map(function() {
  this.route('login', {
    layoutTemplate: 'layoutLogin'
  });
});


Router.map(function() {
  this.route('register', {
    layoutTemplate: 'layoutLogin'
  });
});

Router.route('/about', function() {
  this.render('about');
});


var mustBeSignedIn = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      Router.go('/');
    }
  } else {
    this.next();
  }
};

Router.onBeforeAction('dataNotFound', {
  only: 'spreadsheet'
});

Router.onBeforeAction(mustBeSignedIn, {
  except: ['landing', 'login', 'register', 'passwordRecovery', 'pdf', 'excel']
});
