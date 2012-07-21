
/*
 *  Generic require login routing middleware
 */

exports.assignUserName = function (req, res, next){
    if(req.loggedIn){
      if(req.session.auth.twitter){
        req.userName = req.session.auth.twitter.user.name;
        next();
      }else if(req.session.auth.password){
        req.userName = req.session;
        next();
      }else if(req.session.auth.facebook){
        req.userName = req.session.auth.facebook.user.name;
        next();
      }else{
        next();
      }
    }else{
      req.userName = 'None';
      next();
    }
  };