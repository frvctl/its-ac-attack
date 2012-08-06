exports.userInformation = (req, res, next) ->
  if req.loggedIn
    userInfo = req.user
    req.userInfo = userInfo
    req.userName = userInfo.name.first + " " + userInfo.name.last
    next()
  else
    req.userInfo = "No User"
    req.userName = "None"
    next()