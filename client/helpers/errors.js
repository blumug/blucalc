Errors = new Mongo.Collection(null);


throwError = function(message) {
  Errors.insert({
    message: message
  })
}


DisplayErrorSubmit = function(message) {
  var e = $('<div class="alert alert-dismissable alert-warning"><button type="button" class="close" data-dismiss="alert">×</button><h4>Warning!</h4><p>' + message + '</p></div>');
  $("#alertConnexion").append(e);
  e.attr('id', 'myid');
  setTimeout(function() {
    $("#alertConnexion").remove(".alert");
  }, 3000);
}


DisplaySuccessSubmit = function(message) {
  var e = $('<div class="alert alert-dismissable alert-success"><button type="button" class="close" data-dismiss="alert">×</button><h4>Success!</h4><p>' + message + '</p></div>');
  $("#alertConnexion").append(e);
  e.attr('id', 'myid');
  setTimeout(function() {
    $("div").remove(".alert");
  }, 3000);
}