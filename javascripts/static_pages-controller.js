var mid = require('../../middleware.coffee');

module.exports = function(app){
  
  app.get('/home', function(req, res){
    res.render('static_pages/home', {
      title: 'Home'
    });
  });

  app.get('/contact', function(req, res){
    res.render('static_pages/contact', {
      title: 'Contact'
    });
  });

  app.get('/help', function(req, res){
    res.render('static_pages/help', {
      title: 'Help'
    });
  });

    // home
  app.get('/', function(req, res){
    res.redirect('/home');
  });
};
