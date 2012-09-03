express = require("express")
gzippo = require("gzippo")
mongoStore = require("connect-mongodb")
mongooseAuth = require("mongoose-auth")
url = require("url")
require "coffee-script"

exports.boot = (app) ->
  bootApplication app

bootApplication = (app) ->
  app.configure ->
    app.use require('connect-assets')()
    app.set "views", __dirname + "/app/views"
    app.set "view engine", "jade"
    app.set "view options",
      layout: "layouts/default"

    app.use (req, res, next) ->
      res.local "path", url.parse(req.url).pathname
      res.local "contentFor", (section, str) ->
        res.local section, str

      res.local "content", (section) ->
        unless typeof res.local(section) is "undefined"
          res.local section
        else
          ""

      next()

    app.use express.bodyParser()
    app.use express.methodOverride()
    app.use express.cookieParser()
    app.use express.session(
      secret: "secret"
      store: new mongoStore(
        url: config.db.uri
        collection: "sessions"
      )
    )
    app.use express.logger(":method :url :status")
    app.use express.favicon()
    app.use mongooseAuth.middleware()

  app.dynamicHelpers
    request: (req) ->
      req

    session: (req) ->
      req.session

    dateformat: (req, res) ->
      require("./public/javascripts/lib/dateformat").strftime

    base: ->
      (if "/" is app.route then "" else app.route)

    appName: (req, res) ->
      "an app"

    slogan: (req, res) ->
      "an app"

    loggedIn: (req) ->
      if req.loggedIn
        return true
      else
        return false

    messages: require("express-messages")

  app.set "showStackError", false
  app.configure "development", ->
    app.set("showStackError", true)
    app.use(express.static(__dirname + "/public"))

  app.configure "staging", ->
    app.use(gzippo.staticGzip(__dirname + "/public"))
    app.enable("view cache")

  app.configure "production", ->
    app.use gzippo.staticGzip(__dirname + "/public")
