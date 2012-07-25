mid = require("../../middleware.coffee")

module.exports = (app) ->
  app.get "/home", (req, res) ->
    res.render "static_pages/home",
      title: "Home"

  app.get "/contact", (req, res) ->
    res.render "static_pages/contact",
      title: "Contact"

  app.get "/help", (req, res) ->
    res.render "static_pages/help",
      title: "Help"

  app.get "/", (req, res) ->
    res.redirect "/home"
