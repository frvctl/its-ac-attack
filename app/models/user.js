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
          redirectPath: '/',
          findOrCreateUser: function (sess, accessTok, accessTokExtra, fbUser) {
            var promise = this.Promise(),
                User = this.User()();
            // TODO Check user in session or request helper first
            //      e.g., req.user or sess.auth.userId
            User.findOne({'fb.id': fbUser.id}, function (err, foundUser) {
              if (err) return promise.fail(err);
              if (foundUser) {
                return promise.fulfill(foundUser);
              }
              console.log("CREATING FB USER");

              var expiresDate = new Date;
              expiresDate.setSeconds(expiresDate.getSeconds() + accessTokExtra);

              user = new User({
                  fb: {
                      id: fbUser.id,
                      accessToken: accessTok,
                      expires: expiresDate,
                      name: {
                          full: fbUser.name,
                          first: fbUser.first_name,
                          last: fbUser.last_name
                      },
                      alias: fbUser.fbAlias,
                      gender: fbUser.gender,
                      email: fbUser.email,
                      timezone: fbUser.timezone,
                      locale: fbUser.locale,
                      updatedTime: fbUser.updated_time
                  },
                  profileUrl: fbUser.link,
                  bio: fbUser.bio,
                  location: {
                    name: fbUser.location && fbUser.location.name ? fbUser.location.name : ''
                  }
              });

              user.save( function (err, savedUser) {
                promise.fulfill(savedUser);
              });
            });

            return promise;
          }
      }
    },
    twitter: {
      everyauth: {
          myHostname: config.twitter.host_uri,
          consumerKey: config.twitter.consumerKey,
          consumerSecret: config.twitter.consumerSecret,
          redirectPath: '/',
          findOrCreateUser: function (sess, accessTok, accessTokSecret, twitterUser) {
            var promise = this.Promise(),
                User = this.User()();
            // TODO Check user in session or request helper first
               //      e.g., req.user or sess.auth.userId
            User.findOne({'twitter.id': twitterUser.id}, function (err, foundUser) {
              if (err) return promise.fail(err);
              if (foundUser) {
                return promise.fulfill(foundUser);
              }
              console.log("CREATING TWITTER USER");

              var expiresDate = new Date;
              expiresDate.setSeconds(expiresDate.getSeconds() + accessTokSecret);

              user = new User({
                  twitter: {
                      id: twitterUser.id,
                      accessToken: accessTok,
                      expires: expiresDate,
                      name: twitterUser.name,
                      alias: twitterUser.screen_name,
                      timezone: twitterUser.timezone,
                      locale: twitterUser.locale,
                      updatedTime: twitterUser.updated_time
                  },
                  profileUrl: "http:\/\/twitter.com\/" + twitterUser.screen_name,
                  bio: twitterUser.description,
                  location: twitterUser.location
                  
              });

              user.save( function (err, savedUser) {
                promise.fulfill(savedUser);
              });
            });

            return promise;
      }
    }
  },
  password: {
    loginWith: 'email',
    extraParams: {
      phone: String,
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
      registerSuccessRedirect: '/',
      authenticate: function (login, password) {
        var promise,
            errors = [];
        if (!login) errors.push('Missing login.');
        if (!password) errors.push('Missing password.');
        if (errors.length) return errors;

        promise = this.Promise();
        this.User()().authenticate(login, password, function (err, user) {
          if (err) {
            errors.push(err.message || err);
            return promise.fulfill(errors);
          }
          if (!user) {
            errors.push('Failed login.');
            return promise.fulfill(errors);
          }
          promise.fulfill(user);
        });
        return promise;
       },
       validateRegistration: function (newUserAttrs, errors) {
          var promise = this.Promise(),
            User = this.User()(),
            user = new User(newUserAttrs);
        user.validate( function (err) {
          if (err) {
            errors.push(err.message || err);
          }
          if (errors.length)
            return promise.fulfill(errors);
            promise.fulfill(null);
          });
          return promise;
        },
        registerUser: function (newUserAttrs) {
          var promise = this.Promise();
          this.User()().create(newUserAttrs, function (err, createdUser) {
            if (err) {
              console.log(err); // TODO Make depend on debug flag
              if (/duplicate key/.test(err)) {
                return promise.fulfill(['Someone already has claimed that login.']);
              }
              return promise.fail(err);
            }
            promise.fulfill(createdUser);
          });
          return promise;
        }
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
