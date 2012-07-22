User = mongoose.model('User');

/*
 *  Generic require login routing middleware
 */

exports.userInformation = function (req, res, next){
  function getUserInfo(userInfo, callback){
    User.find({_id:userInfo}, function(err, userJson){
      callback(userJson);
    });
  }
    if(req.loggedIn){
      if(req.session.auth.twitter){
        req.userInfo = req.session.auth.twitter.user;
        next();
      }else if(req.session.auth.facebook){
        req.userInfo = req.session.auth.facebook.user;
        console.log('FACEBOOKINFO' + req.userInfo);
        next();
      }else{
        getUserInfo(req.session.auth.userId, function(userInfo){
          console.log('Getting user info' + userInfo);
          req.userName = 'derp';
          req.userInfo = userInfo[0];
          next();
        });
      }
    }else{
      req.userName = 'None';
      next();
  }
};