Question = mongoose.model("Question")
mid = require("../../middleware.coffee")
Chat = mongoose.model("Chat")

module.exports = (app) ->
  io = require('socket.io').listen(app)
  fs = require('fs')
  checkAnswer = require('../../public/javascripts/answer/answerparse').checkAnswer
  damlev = require('../../public/javascripts/answer/levenshtein').levenshtein
  syllables = require('../../public/javascripts/answer/syllable').syllables
  parseCookie = require('express/node_modules/connect').utils.parseCookie
  crypto = require('crypto')
  
  io.configure 'development', () ->
    io.set 'log level', 2

  io.configure 'production', () ->
    io.enable 'browser client minification'
    io.enable 'browser client etag'
    io.disable 'browser client gzip'
    io.set 'transports', ["xhr-polling"]
    io.set 'polling duration', 10
    io.set 'log level', 1
    io.set "authorization", (data, fn) ->
      if !data.headers.cookie
        return fn 'No cookie header', false
      cookie = parseCookie(data.headers.cookie)
      if cookie
        console.log "GOT COOKIE", data.headers.cookie

        data.sessionID = cookie['connect.sid']
        fn null, true #woot
      fn 'No cookie found', false

  questions = []
  fs.readFile 'questions.txt', 'utf8', (err, data) ->
    throw err if err
    questions = (JSON.parse(line) for line in data.split("\n"))

  cumsum = (list, rate) ->
    sum = 0 #start nonzero, allow pause before rendering
    for num in [1].concat(list).slice(0, -1)
      sum += Math.round(num) * rate #always round!

  class QuizRoom
    constructor: (name) ->
      @name = name
      @answer_duration = 1000 * 5
      @time_offset = 0
      @rate = 1000 * 60 / 5 / 200
      @freeze()
      @new_question()
      @users = {}

    add_socket: (id, socket) ->
      unless id of @users
        @users[id] = {
          sockets: [],
          guesses: 0,
          interrupts: 0,
          early: 0,
          correct: 0,
          last_action: 0
        }
      user = @users[id]
      user.id = id
      user.last_action = @serverTime()
      unless socket in user.sockets
        user.sockets.push socket

    vote: (id, action, val) ->
      @users[id][action] = val
      @sync()

    touch: (id) ->
      @users[id].last_action = @serverTime()

    del_socket: (id, socket) ->
      user = @users[id]
      if user
        user.sockets = (sock for sock in user.sockets when sock isnt socket)

    time: ->
      return if @time_freeze then @time_freeze else @serverTime() - @time_offset

    serverTime: ->
      return +new Date

    freeze: ->
      @time_freeze = @time()

    unfreeze: ->
      if @time_freeze
        @set_time @time_freeze
        @time_freeze = 0

    set_time: (ts) ->
      @time_offset = new Date - ts

    pause: ->
      #no point really because being in an attempt means being frozen
      @freeze() unless @attempt or @time() > @end_time

    unpause: ->
      #freeze with access controls
      @unfreeze() unless @attempt

    timeout: (metric, time, callback) ->
      diff = time - metric()
      if diff < 0
        callback()
      else
        setTimeout =>
          @timeout(metric, time, callback)
        , diff

    new_question: ->
      @attempt = null
      question = questions[Math.floor(questions.length * Math.random())]
      @info = {
        category: question.category, 
        difficulty: question.difficulty, 
        tournament: question.tournament, 
        num: question.question_num, 
        year: question.year, 
        round: question.round
      }
      @question = question.question
        .replace(/FTP/g, 'For 10 points')
        .replace(/^\[.*?\]/, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
      @answer = question.answer
        .replace(/\<\w\w\>/g, '')
        .replace(/\[\w\w\]/g, '')

      @begin_time = @time()
      @timing = (syllables(word) + 1 for word in @question.split(" "))
      @set_speed @rate #do the math with speeds
      @sync(2)

    set_speed: (rate) ->
      now = @time() # take a snapshot of time to do math with
      #first thing's first, recalculate the cumulative array
      @cumulative = cumsum @timing, @rate
      #calculate percentage of reading right now
      elapsed = now - @begin_time
      duration = @cumulative[@cumulative.length - 1]
      done = elapsed / duration

      # if it's past the actual reading time
      # this means altering the rate doesnt actually
      # affect the length of the answer_duration
      remainder = 0
      if done > 1
        remainder = elapsed - duration
        done = 1

      # set the new rate
      @rate = rate
      # recalculate the reading intervals
      @cumulative = cumsum @timing, @rate
      new_duration = @cumulative[@cumulative.length - 1]
      #how much time has elapsed in the new timescale
      @begin_time = now - new_duration * done - remainder
      # set the ending time
      @end_time = @begin_time + new_duration + @answer_duration

    skip: ->
      @new_question()

    emit: (name, data) ->
      io.sockets.in(@name).emit name, data

    end_buzz: (session) ->
      if @attempt?.session is session
        @touch @attempt.user
        @attempt.done = true
        @attempt.correct = checkAnswer @attempt.text, @answer

        @sync()
        @unfreeze()
        if @attempt.correct
          @users[@attempt.user].correct++
          if @attempt.early 
            @users[@attempt.user].early++
          @set_time @end_time
        else if @attempt.interrupt
          @users[@attempt.user].interrupts++
        @attempt = null #g'bye
        @sync(1) #two syncs in one request!

    buzz: (user) -> #todo, remove the callback and replace it with a sync listener
      @touch user
      if @attempt is null and @time() <= @end_time
        # fn 'http://www.whosawesome.com/'
        session = Math.random().toString(36).slice(2)
        early_index = @question.replace(/[^ \*]/g, '').indexOf('*')

        @attempt = {
          user: user,
          realTime: @serverTime(), # oh god so much time crap
          start: @time(),
          duration: 8 * 1000,
          session, # generate 'em server side 
          text: '',
          early: early_index and @time() < @begin_time + @cumulative[early_index],
          interrupt: @time() < @end_time - @answer_duration,
          done: false
        }

        @users[user].guesses++

        @freeze()
        @sync(1) #partial sync
        @timeout @serverTime, @attempt.realTime + @attempt.duration, =>
          @end_buzz session

    guess: (user, data) ->
      @touch user
      if @attempt?.user is user
        @attempt.text = data.text
        # lets just ignore the input session attribute
        # because that's more of a chat thing since with
        # buzzes, you always have room locking anyway
        if data.done
          # do done stuff
          console.log 'omg done clubs are so cool ~ zuck'
          @end_buzz @attempt.session
        else
          @sync()

    sync: (level = 0) ->
      data = {
        real_time: +new Date,
        voting: {}
      }
      voting = ['skip', 'pause', 'unpause']
      for action in voting
        yay = 0
        nay = 0
        actionvotes = []
        for id of @users
          vote = @users[id][action]
          if vote is 'yay'
            yay++
            actionvotes.push id
          else
            nay++
        if actionvotes.length > 0
          data.voting[action] = actionvotes
        if yay / (yay + nay) > 0
          delete @users[id][action] for id of @users
          this[action]()
      blacklist = ["name", "question", "answer", "timing", "voting", "info", "cumulative", "users"]
      user_blacklist = ["sockets"]
      for attr of this when typeof this[attr] != 'function' and attr not in blacklist
        data[attr] = this[attr]
      if level >= 1
        data.users = for id of @users
          user = {}
          for attr of @users[id] when attr not in user_blacklist
            user[attr] = @users[id][attr] 
          user.online = @users[id].sockets.length > 0
          user

      if level >= 2
        data.question = @question
        data.answer = @answer
        data.timing = @timing
        data.info = @info

      io.sockets.in(@name).emit 'sync', data

  sha1 = (text) ->
    hash = crypto.createHash('sha1')
    hash.update(text)
    hash.digest('hex')

  rooms = {}
  io.sockets.on 'connection', (sock) ->
    sessionID = sock.handshake.sessionID
    publicID = null
    room = null

    sock.on 'join', (data, fn) ->
      if data.old_socket and io.sockets.socket(data.old_socket)
        io.sockets.socket(data.old_socket).disconnect()

      room_name = data.room_name

      publicID = sha1(sessionID + room_name) #preserves a sense of privacy

      sock.join room_name
      rooms[room_name] = new QuizRoom(room_name) unless room_name of rooms
      room = rooms[room_name]
      room.add_socket publicID, sock.id
      unless 'name' of room.users[publicID]
        room.users[publicID].name = require('../../public/javascripts/multiplayer/names').generateName()
      fn {
        id: publicID,
        name: room.users[publicID].name
      }
      room.sync(2)
      room.emit 'introduce', {user: publicID}

    sock.on 'echo', (data, callback) =>
      callback +new Date

    sock.on 'rename', (name) ->
      room.users[publicID].name = name
      room.touch(publicID)
      room.sync(1) if room

    sock.on 'skip', (vote) ->
      room.vote publicID, 'skip', vote

    sock.on 'pause', (vote) ->
      room.vote publicID, 'pause', vote

    sock.on 'unpause', (vote) ->
      room.vote publicID, 'unpause', vote

    sock.on 'speed', (data) ->
      room.set_speed data
      room.sync()

    sock.on 'buzz', (data, fn) ->
      room.buzz(publicID, fn) if room

    sock.on 'guess', (data) ->
      room.guess(publicID, data)  if room

    sock.on 'chat', ({text, done, session}) ->
      if room
        room.touch publicID
        room.emit 'chat', {text: text, session:  session, user: publicID, done: done, time: room.serverTime()}

    sock.on 'disconnect', ->
      console.log "someone", publicID, sock.id, "left"
      if room
        delete room.users[publicID]
        room.del_socket publicID, sock.id
        room.sync(1)
        room.emit 'leave', {user: publicID}

  app.get "/multiplayer", mid.userInformation, (req, res) ->
    roomName = req.query.roomName
    roomParams = {"difficulty": req.query.difficulty, "gameMode": req.query.gamemode}
    if not roomName
      res.render "multiplayer/multiplayer-selectRoom", {
        title: 'Select Room',
        rooms: rooms,
        roomParams: roomParams,
        userName: req.userName
      }
    else
      res.redirect '/multiplayer/' + roomName

  app.get "/multiplayer/:channel", mid.userInformation, (req, res) ->
    name = req.params.channel    
    res.render 'multiplayer/multiplayer-practice', {
      title: 'Multiplayer Practice'
      name,
      loggedIn: req.loggedIn,
      user: req.userInfo,
      userName: req.userName 
    }
