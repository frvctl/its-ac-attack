var User = mongoose.model('User'),
    mid = require('../../middleware.js');

module.exports = function (app) {

  // Handles Sign-up
  app.get('/signup', mid.userInformation, function(req, res){
    res.render('users/signup', {
      title: 'Sign Up',
      userName: req.userName
    });
  });

  // Handles Session Login
  app.get('/login', mid.userInformation, function(req, res){
    res.render('users/login', {
      title: 'Login',
      userName: req.userName
    });
  });

  app.param('profileId', function (req, res, next) {
    next();
  });
    
  // Profile view
  app.get('/profile/:profileId', mid.userInformation, function (req, res) {
    res.render('users/profile', {
        title: 'Profile',
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
