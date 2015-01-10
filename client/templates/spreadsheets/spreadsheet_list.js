

Template.spreadsheetList.helpers({
  'spreadsheetList': function() {
    var filter = Session.get("searchBar");
    var escape = function(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    if (filter && filter != "") {
      filter = escape(filter);

      return Spreadsheets.find({
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