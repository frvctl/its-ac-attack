
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('static_pages/home');
};

exports.search = function(req, res){
    res.render('db_interaction/search');
};

exports.partials = function(req, res){
	var name = req.params.name;
	res.render('partials/' + name);
};

exports.contact = function(req, res){
    res.render('static_pages/contact');
};

exports.login = function(req, res){
    res.render('authentication/login');
};

exports.signup = function(req, res){
    res.render('authentication/signup');
};

exports.logout = function(req, res){
    req.logout(),
    res.redirect('/');
};