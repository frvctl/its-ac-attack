var exports = module.exports = everyauth = require('everyauth'),
    UserSchema = new Schema({}),
    User;

var exports = module.exports = mongooseAuth = require('mongoose-auth');

everyauth.debug = true;

UserSchema.plugin(mongooseAuth, {
    everymodule: {
      everyauth: {
        User: function () {
          return User;
        }
      }
    },
    // facebook: {
    //     everyauth: {
    //       myHostname: 'http://localhost:3000',
    //       appId: 'YOUR APP ID HERE',
    //       appSecret: 'YOUR APP SECRET HERE',
    //       redirectPath: '/'
    //   }
    // },
    // twitter: {
    //     everyauth: {
    //       myHostname: 'http://localhost:3000',
    //       consumerKey: conf.twit.consumerKey,
    //       consumerSecret: conf.twit.consumerSecret,
    //       redirectPath: '/'
    //   }
    // },
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

// virtual attributes

var exports = module.exports = User = mongoose.model('User', UserSchema);