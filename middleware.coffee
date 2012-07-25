User = mongoose.model("User")

exports.userInformation = (req, res, next) ->
  getUserInfo = (userInfo, callback) ->
    User.find
      _id: userInfo
    , (err, userJson) ->
      callback userJson
  if req.loggedIn
    getUserInfo req.session.auth.userId, (userInfo) ->
      req.userInfo = userInfo[0]
      req.userName = userInfo[0].name.first + " " + userInfo[0].name.last
      next()
  else
    req.userInfo = "No User"
    req.userName = "None"
    next()