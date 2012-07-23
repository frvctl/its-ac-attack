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
    getUserInfo(req.session.auth.userId, function(userInfo){
      req.userInfo = userInfo[0];
      req.userName = userInfo[0].name.first + " " + userInfo[0].name.last;
      next();
    });
  }else{
    req.userInfo = 'No User';
    req.userName = 'None';
    next();
  }
};