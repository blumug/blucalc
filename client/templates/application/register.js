Template.register.events({
  'submit #register-form': function(e, t) {
    e.preventDefault();

    var isValidPassword = function(val, field) {
      if (val.length >= 6) {
        return true;
      } else {
        return false;
      }
    }

    var trimInput = function(val) {
      return val.replace(/^\s*|\s*$/g, "");
    }

    var email = trimInput(t.find('#account-email').value),
      password = t.find('#account-password').value;


    if (isValidPassword(password)) {
      Accounts.createUser({
        email: email,
        password: password
      }, function(err) {
        if (err) {
          // Inform the user that account creation failed
        } else {
          // Success. Account has been created and the user
          // has logged in successfully. 
          Router.go('/home');
        }
      });
    } else {
      DisplayErrorSubmit("Invalid password");
    }
    return false;
  }
});