
express = require("express")

exports.boot = (app) ->
  bootErrorHandler app

# Error configuration

bootErrorHandler = (app) ->

  # When no more middleware require execution, aka
  # our router is finished and did not respond, we
  # can assume that it is "not found". Instead of
  # letting Connect deal with this, we define our
  # custom middleware here to simply pass a NotFound
  # exception

  NotFound = (path) ->
    @name = "NotFound"
    if path
      Error.call this, "Cannot find " + path
      @path = path
    else
      Error.call this, "Not Found"
    Error.captureStackTrace this, arguments.callee
  app.use (req, res, next) ->
    next new NotFound(req.url)

  NotFound::__proto__ = Error::
  app.error (err, req, res, next) ->
    if err instanceof NotFound
      console.log err.stack
      res.render "404",
        status: 404
        error: err
        showStack: app.settings.showStackError
        title: "Oops! The page you requested desn't exist"
    else
      console.log err.stack
      res.render "500",
        status: 500
        error: err
        showStack: app.settings.showStackError
        title: "Oops! Something went wrong!"