mid = require("../../middleware.coffee")

module.exports = (app) ->
  app.get "/home", mid.userInformation, (req, res) ->
    res.render "static_pages/home", {
      title: "Home",
      userName: req.userName
    }

  app.get "/contact", mid.userInformation, (req, res) ->
    res.render "static_pages/contact", {
      title: "Contact",
      userName: req.userName
    }

  app.get "/help", mid.userInformation, (req, res) ->
    res.render "static_pages/help", {
      title: "Help", 
      userName: req.userName
    }

  app.get "/about", mid.userInformation, (req, res) ->
    res.render "static_pages/about", {
      title: "About", 
      userName: req.userName
    }

  app.get "/", (req, res) ->
    res.redirect "/home"
