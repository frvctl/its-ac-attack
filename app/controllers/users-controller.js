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
    // if(req.loggedIn){
    //   if(req.session.auth.twitter){
    //     user = req.session.auth.twitter.user.name;
    //   }else{
    //     user = req.session.auth.facebook.user.name;
    //   }
    // }else{
    //   user = 'None';
    // }
    user = req.session.auth.twitter.user.name;
    req.foundUser = user;
    next();
  });
    
  // Profile view
  app.get('/profile/:profileId', function (req, res) {
    var user = req.foundUser;
    console.log(req.foundUser);
    res.render('users/profile', {
        title : 'Profile',
        user : req.foundUser,
        userName: req.userName
    });
  });

  // Handles session Logout
  app.get('/logout', function (req, res) {
    req.logout(),
    res.redirect('/home')
  });
};
