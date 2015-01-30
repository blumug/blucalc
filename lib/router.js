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

Router.route('/export/excel/:_id', {
  name: 'excel',
  action: function() {
    var ex = new Excel('xlsx');
    var workSheet = ex.createWorksheet();
    var sheets = Spreadsheets.findOne({
      _id: this.params._id
    }).data.sheets;
    var name = Spreadsheets.findOne({
      _id: this.params._id
    }).name;

    var workBook = ex.createWorkbook();
    _.each(sheets, function(sheet) {
      var sheetWork = ex.createWorksheet();
      var dataTable = sheet.data.dataTable;
      _.each(dataTable, function(row, y) {
        _.each(row, function(cell, x) {
          sheetWork.writeToCell(parseInt(y, 10), parseInt(x, 10), cell.value);
        });
      });
      workBook.addSheet(sheet.name, sheetWork);
    });
    workBook.writeToFile("/tmp/tmpSheet.xlsx");
    var fs = Npm.require('fs');
    var content = fs.readFileSync('/tmp/tmpSheet.xlsx');
    var headers = {
      'Content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': "attachment; filename=" + name + ".xlsx"
    };
    this.response.writeHead(200, headers);
    return this.response.end(content);
  },
  where: 'server'
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
  except: ['landing', 'login', 'register', 'passwordRecovery', 'excel']
});
