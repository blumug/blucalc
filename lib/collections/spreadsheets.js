Spreadsheets = new Mongo.Collection('spreadsheets');

Spreadsheets.allow({
    insert: function(userId, doc) {
        return doc && doc.userId === userId;
    },

    remove: function(userId, doc) {
    	return true;
//        return doc && doc.userId === userId;
    },

    update: function(userId, doc) {
        return doc && doc.userId === userId;
    }
});

Meteor.methods({
    'spreadsheetUpdate': function(spreadsheet) {
        if (Meteor.isServer) {
            Spreadsheets.update({
                _id: spreadsheet._id
            }, {
                $set: _.omit(spreadsheet, '_id')
            });
        }
    }
});