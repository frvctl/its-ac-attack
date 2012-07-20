var exports = module.exports = everyauth = require('everyauth'),
    Promise = everyauth.Promise,
    UserSchema = new Schema({}),
    User;


var exports = module.exports = mongooseAuth = require('mongoose-auth');

everyauth.debug = true;

// This is how you request permissions
everyauth.facebook.scope('email, user_about_me, user_location');


// Eleminate timeout completely
everyauth.facebook.moduleTimeout(-1);
everyauth.twitter.moduleTimeout(-1);

// To see all the configurable options
// console.log(everyauth.facebook.configurable())

UserSchema.add({
    bio: String,
    location: {
      name: String
    },
    profileUrl: String,
    created_at  : {type : Date, default : Date.now}
});


UserSchema.plugin(mongooseAuth, {
    everymodule: {
      everyauth: {
        User: function () {
          return User;
        }
      }
    },
    facebook: {
      everyauth: {
        myHostname: config.facebook.host_uri,
        appId: config.facebook.appId,
        appSecret: config.facebook.appSecret,
        redirectPath: '/'
      }
    },
    twitter: {
      everyauth: {
        myHostname: config.twitter.host_uri,
        consumerKey: config.twitter.consumerKey,
        consumerSecret: config.twitter.consumerSecret,
        redirectPath: '/'
    }
  },
  password: {
    extraParams: {
      email: String,
      name: {
        first: String,
        last: String
      }
    },
    everyauth: {
      getLoginPath: '/login',
      postLoginPath: '/login',
      loginView: '../views/users/login.jade',
      getRegisterPath: '/signup',
      postRegisterPath: '/signup',
      registerView: '../views/users/signup.jade',
      loginSuccessRedirect: '/',
      registerSuccessRedirect: '/'
      }
    }
});

// validations
UserSchema.path('fb.name.full').validate(function (name) {
  return name.trim().split(' ').length >= 2;
}, 'Please provide your fullname');

UserSchema.path('fb.email').validate(function (email) {
  return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i.test(email);
}, 'Please provide a proper email');


// virtual attributes

var exports = module.exports = User = mongoose.model('User', UserSchema);
