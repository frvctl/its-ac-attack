
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('static_pages/home', {title: "Home"});
};

exports.search = function(req, res){
    res.render('domain/search', {title: "Search"});
};

exports.partials = function(req, res){
	var name = req.params.name;
	res.render('partials/' + name, {title: " " + name});
};

exports.contact = function(req, res){
    res.render('static_pages/contact', {title: "Contact"});
};

exports.about = function(req, res){
	res.render('static_pages/about', {title: "About"});
};

exports.login = function(req, res){
    res.render('user/login', {title: "Login"});
};

exports.signup = function(req, res){
    res.render('user/signup', {title: "Sign up"});
};

exports.logout = function(req, res){
    req.logout(),
    res.redirect('/');
};