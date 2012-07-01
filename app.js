
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    util = require('util'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

//Faux DB

var users = [
    {id: 1, username: 'bob', password: 'secret', email: 'bob@example.com'},
    {id: 2, username: 'joe', password: 'birthday', email: 'joe@exapmle.com'}
];

// Authentication System

function findById(id, fn){
    var idx = id - 1;
    if(users[idx]) {
        fn(null, users[idx]);
    }else{
        fn(new Error('User ' + id + ' does not exist'));
    }
}

function findByUsername(username, fn){
    for(var i = 0, len = users.length; i < len; i++){
        var users = users[i];
        if (user.username === username){
            return fn(null, user);
        }
    }
    return fn(null, null);
}

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    findById(id, function(err, user){
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done){
        process.nextTick(function(){
            findByUsername(username, function(err, user){
                if(err){return done(err);}
                if(!user) {return done(null, false, {message: 'Unknown User ' + username});}
                if(user.password != password) {return done(null, false, {message:'Invalid Password'});}
                return done(null, user);
            })
        });
    }
));

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'lolmonkeyz' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/search', routes.search);
app.get('/blog/:name', routes.partials);
app.get('/contact', routes.contact);
app.get('/login', routes.login);
app.get('/signup', routes.signup);
app.get('/logout', routes.logout);


app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()) {return next();}
    res.redirect('/login');
}
