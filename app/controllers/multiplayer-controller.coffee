Question = mongoose.model("Question")
mid = require("../../middleware.coffee")
Chat = mongoose.model("Chat")

getNextQuestion = (numToSkip, searchIndx, callback) ->
  if searchIndx
    Question.find
      $or: [
          (category: $regex: searchIndx)
        , (answer: $regex: searchIndx)
        , (difficulty: $regex: searchIndx)
        , (tournament: $regex: searchIndx)
        , (year: $type: 18)
        ],(
          category: 1
          answer: 1
          difficulty: 1
          question: 1
          year: 1
          tournament: 1
        ),(
          skip: numToSkip
          limit: 1
        ),((err, question) -> 
          callback question
        )

module.exports = (app) ->
  io = require("socket.io").listen(app)
  syllables = require('../../public/javascripts/syllable.coffee').syllables
  damlev = require('./levenshtein').levenshtein

  active_channels = {}
  users = {}

  io.configure "development", ->
    io.set "log level", 2

  io.configure "production", ->
    io.enable "browser client minification"
    io.enable "browser client etag"
    io.disable "browser client gzip"
    io.set "transports", [ "xhr-polling" ]
    io.set "polling duration", 10
    io.set "log level", 1

  cumsum = (list, rate) ->
    sum = 0
    for num in list
      sum += Math.round(num) * rate #always round!

  class Channel 
    constructor: (name) ->
      console.log "initializing channel", name
      @ns = io.of(name)
      @timeOffset = 0
      @timeCallbacks = []
      @revealDelay = 2 * 1000
      @nextQuestion()
      @ns.on 'connection', (socket) =>
        @addUser(socket)

    onTime: (time, callback) ->
      @timeCallbacks.push [@getTime() + time, callback]
      @checkTime()

    checkTime: ->
      continuing = []
      execution_queue = []
      for [time, fn] in @timeCallbacks
        if time <= @getTime()
          execution_queue.push fn
        else
          setTimeout =>
            @checkTime()
          , time - @getTime()
          continuing.push [time, fn]
      @timeCallbacks = continuing
      fn() for fn in execution_queue

    getTime: ->
      if @timeFreeze
        return @timeFreeze
      else
        return +new Date - @timeOffset

    getTiming: ->
      {
        list: syllables(word) for word in @question.question.split(" "),
        rate: 1000 * 60 / 2 / 300
      }

    nextQuestion: ->
      @timeCallbacks = []
      @completed = false
      @timeFreeze = 0
      @countDuration = 0
      @countStart = 0
      @tableOwner = null
      @question = getNextQuestion(1, 'History', (question) ->
      @question.question = @question.question
      .replace(/FTP/g, 'For 10 points')
      .replace(/^\[.*?\]/, '')
      .replace(/\n/g, ' ')
      delete @question.pKey
      @question.timing = @getTiming()
      @lastTime = @getTime()
      {list, rate} = @question.timing
      @ns.emit "sync", @synchronize(true)

      @onTime cumsum(list, rate).slice(-1)[0] + @revealDelay, =>
        setTimeout =>
          @nextQuestion()
        , 2000 #show the question for a few seconds
      )

    buzz: (data, callback, socket) ->
      if @timeFreeze
        if socket is @tableOwner
          callback "you dont have too much time left!"
        else
          callback "you lost the game!"
      else
        @countDuration = 6 * 1000 # 10 seconds
        @countStart = +new Date #not that it's not server time!

        socket.name = data.name
        socket.guess = ""
        @tableOwner = socket

        @freeze()
        @freezeTimeout = setTimeout =>
          @unfreeze()
        , @countDuration

        callback "who's awesome? you are!" #tell the user he won the game

    freeze: ->
      @timeFreeze = @getTime() # freeze time at this point now
      @ns.emit "sync", @synchronize()

    unfreeze: ->
      if @timeFreeze
        clearTimeout @freezeTimeout
        @timeOffset = new Date - @timeFreeze
        @timeFreeze = 0
        @tableOwner = null
        @countDuration = 0
        @ns.emit "sync", @synchronize()
        console.log "time circuits", @timeOffset
      @checkTime()

    checkAnswer: (guess) ->
      a = guess.toLowerCase().replace(/[^a-z0-9]/g,'')
      b = @question.answer.toLowerCase()
      .replace(/\(.*\)/g, '')
      .replace(/\[.*\]/g, '')
      .replace(/[^a-z0-9]/g,'')
      return damlev(a, b) < 2

    guess: (data, callback, socket) ->
      if socket is @tableOwner
        socket.guess = data.guess
        if data.final is true
          @unfreeze()
          if @checkAnswer(data.guess)
            callback "yay"
            @completed = true
            @freeze()
            setTimeout =>
              @nextQuestion()
            , 2000
          else
            callback "nay"
        else
          callback "okay"
          @ns.emit "sync", @synchronize()
      else
        callback "not allowed to guess"

    newUser: (name) ->
      if not users[name] then users[name] = socket.name = name
    
    makeAnnouncement: (announcement) ->
      socket.broadcast.to(name).emit "announcement", announcement

    userMessage: (message) ->
      socket.broadcast.to(socket.room).emit "user message", socket.name, msg
  
    addUser: (socket) ->
      console.log "Adding a new user to the channel"
      socket.emit 'sync', @synchronize(true)
      socket.on 'echo', (data, callback) =>
        callback +new Date
      socket.on 'disconnect', =>
        console.log "user disconnected"
      socket.on 'buzz', (data, callback) =>
        @buzz(data, callback, socket)
      socket.on 'guess', (data, callback) =>
        @guess(data, callback, socket)
      socket.on 'unpause', (data, callback) =>
        @unfreeze()
      socket.on 'pause', (data, callback) =>
        @freeze()
      socket.on 'user', (data, callback) =>
        @checkUser(data)
        @makeAnnouncement(data + "connected")
      socket.on 'userMessage', (data, callback) =>
        @userMessage(data)
      socket.on 'anAnnouncement', (data, callback) =>
        @makeAnnouncement(data)
      socket.on 'skip', (data, callback) =>
        @completed = true
        @freeze()
        setTimeout =>
          @nextQuestion()
        , 2000
    
    synchronize: (all) ->
      data = {
        time: @getTime(), 
        lastTime: @lastTime, 
        revealDelay: @revealDelay, 
        tableOwner: @tableOwner?.name,
        theUsers: users
        messages: messages
        completed: @completed,
        guess: @tableOwner?.guess,
        countDuration: Math.max(0, @countDuration - (new Date - @countStart)),
        timeFreeze: @timeFreeze
      }

      #only send the quesiton data if its necessary to keep the transactions
      #somewhat lightweight
      data.question = @question if all
      return data

  init_channel = (name) ->
    unless name of active_channels
      active_channels[name] = new Channel(name)

  app.param "channel", (req, res, next) ->
    next()

  app.get "/multiplayer", (req, res) ->
    if req.loggedIn
      res.render "multiplayer/multiplayer-selectRoom",
        title: "Select Room"
    else
      res.render "users/notAuthorized",
        title: "Select Room"

  app.get "/multiplayer/:channel", mid.userInformation, (req, res) ->
    if req.loggedIn
      name = "/" + req.params
      init_channel name
      res.render "multiplayer/multiplayer-test",
        title: "Multiplayer"
        name, 
        initial: JSON.stringify(active_channels[name].synchronize(true))
        loggedIn: req.session.auth
        userName: req.userName
    else
      req.flash "info", "You are not authorized"
      res.redirect "/login"