var mid = require('../../middleware.js');

module.exports = function(app){
  
  app.get('/home', mid.userInformation, function(req, res){
    res.render('static_pages/home', {
      title: 'Home',
      userName: req.userName
    });
  });

  app.get('/contact', mid.userInformation, function(req, res){
    res.render('static_pages/contact', {
      title: 'Contact',
      userName: req.userName
    });
  });

  app.get('/help', mid.userInformation, function(req, res){
    res.render('static_pages/help', {
      title: 'Help',
      userName: req.userName
    });
  });

    // home
  app.get('/', function(req, res){
    res.redirect('/home');
  });
};
