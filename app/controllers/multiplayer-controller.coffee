Question = mongoose.model("Question")
mid = require("../../middleware.coffee")
Chat = mongoose.model("Chat")

getNQAndCA = (userAnswer, numToSkip, searchIndx, callback) ->
  if searchIndx
    Question.find
      $or: [
        category:
          $regex: searchIndx
      ,
        answer:
          $regex: searchIndx
      ,
        difficulty:
          $regex: searchIndx
      ,
        tournament:
          $regex: searchIndx
      ,
        year:
          $type: 18
       ],
    (
      category: 1
      answer: 1
      difficulty: 1
      question: 1
      year: 1
      tournament: 1
    )
    ( skip: numToSkip
      limit: 1
    )
    (err, question) ->
      callback question
      if userAnswer
        ansTruth = undefined
        regexMatch = question[0].answer.match(/(.*?)( \[(.*)\])?$/)
        theAns = regexMatch[1]
        insideBrackets = regexMatch[3]
        throw "shitstorm"  if regexMatch is null
        throw "nothing in brackets"  if insideBrackets is null
        if userAnswer
          if userAnswer.toLowerCase() is theAns.toLowerCase()
            ansTruth = true
          else
            ansTruth = false
          callback ansTruth

module.exports = (app) ->
  io = require("socket.io").listen(app)
  users = {}
  channels = {}
  
  io.configure "development", ->
    io.set "log level", 2

  io.configure "production", ->
    io.enable "browser client minification"
    io.enable "browser client etag"
    io.disable "browser client gzip"
    io.set "transports", [ "xhr-polling" ]
    io.set "polling duration", 10
    io.set "log level", 1

  io.sockets.on "connection", (socket) ->
    socket.questNum = 0

    socket.on "join room", (room) ->
      socket.join room
      socket.room = room

    socket.on "user message", (msg) ->
      socket.broadcast.to(socket.room).emit "user message", socket.name, msg
     
    socket.on "user", (name) ->
      if users[name]
        socket.to(socket.room).emit "names", users
      else
        users[name] = socket.name = name
        socket.broadcast.to(socket.room).emit "announcement", name + " connected"
        io.sockets.in(socket.room).emit "names", users

    socket.on "question", (questNum) ->
      getNQAndCA null, questNum, "History", (question) ->
        socket.quesNum = questNum
        io.sockets.emit "start", question
        io.sockets.emit "currentQuestion", question

    socket.on "buzzed", (data) ->
      io.sockets.emit "announcement", data + " pressed the buzzer"
      socket.broadcast.emit "lockout", data
      socket.emit "theBuzzer", data

    socket.on "answer", (data) ->
      console.log socket.quesNum
      getNQAndCA data, socket.quesNum, "History", (theTruth) ->
        socket.emit "answerResult", theTruth
    
    socket.on "disconnect", ->
      return if not socket.name
      delete users[socket.name]
      socket.broadcast.to(socket.room).emit("announcement", socket.name + "disconnected")
      io.sockets.in(socket.room).emit('names', users)

    app.param 'channel', (req, res, next) ->
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
      theChannel = req.params
      res.render "multiplayer/multiplayer-practice",
        title: "Multiplayer"
        channel: theChannel.channel
        loggedIn: req.session.auth
        userName: req.userName
    else
      req.flash "info", "You are not authorized"
      res.redirect "/login"