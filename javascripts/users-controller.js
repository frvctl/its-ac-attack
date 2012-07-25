var User = mongoose.model('User'),
    mid = require('../../middleware.coffee');

module.exports = function (app) {

  // Handles Sign-up
  app.get('/signup', function(req, res){
    res.render('users/signup', {
      title: 'Sign Up'
    });
  });

  // Handles Session Login
  app.get('/login', function(req, res){
    res.render('users/login', {
      title: 'Login'
    });
  });

  // Profile view
  app.get('/profile', mid.userInformation, function (req, res) {
    res.render('users/profile', {
        title: 'Profile',
        loggedIn: req.loggedIn,
        user: req.userInfo,
        userName: req.userName
    });
  });

  // Handles session Logout
  app.get('/logout', function (req, res) {
    req.logout(),
    res.redirect('/home')
  });
};
