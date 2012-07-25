User = mongoose.model("User")
mid = require("../../middleware.coffee")

module.exports = (app) ->
  app.get "/signup", (req, res) ->
    res.render "users/signup",
      title: "Sign Up"

  app.get "/login", (req, res) ->
    res.render "users/login",
      title: "Login"

  app.get "/profile", mid.userInformation, (req, res) ->
    res.render "users/profile",
      title: "Profile"
      loggedIn: req.loggedIn
      user: req.userInfo
      userName: req.userName

  app.get "/logout", (req, res) ->
    req.logout()
    res.redirect("/home")
