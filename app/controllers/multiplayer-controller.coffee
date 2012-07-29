Question = mongoose.model("Question")
mid = require("../../middleware.coffee")
Chat = mongoose.model("Chat")

module.exports = (app) ->
  io = require('socket.io').listen(app)
  fs = require('fs')
  checkAnswer = require('../../public/javascripts/answerparse').checkAnswer
  damlev = require('../../public/javascripts/levenshtein').levenshtein
  syllables = require('../../public/javascripts/syllable').syllables
  
  io.configure 'development', () ->
    io.set 'log level', 2

  io.configure 'production', () ->
    io.enable 'browser client minification'
    io.enable 'browser client etag'
    io.disable 'browser client gzip'
    io.set 'transports', ["xhr-polling"]
    io.set 'polling duration', 10
    io.set 'log level', 1

  questions = []

  fs.readFile 'questions.txt', 'utf8', (err, data) ->
    throw err if err
    questions = (JSON.parse(line) for line in data.split("\n"))
    # questions = [{question: "to galvanization to galvanization to galvanization to galvanization to galvanization to galvanization to galvanization"}]

  cumsum = (list, rate) ->
    sum = 0
    for num in list
      sum += Math.round(num) * rate #always round!

  class QuizRoom
    constructor: (name) ->
      @name = name
      @time_offset = 0
      @new_question()
      @attempt = null
      @freeze()

    time: ->
      return if @time_freeze then @time_freeze else @serverTime() - @time_offset

    serverTime: ->
      return +new Date

    freeze: ->
      @time_freeze = @time()

    unfreeze: ->
      if @time_freeze
        # @time_offset = new Date - @time_freeze
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

      answer_time = 1000 * 5
      @begin_time = @time()
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
      @answer = question.answer
        .replace(/\<\w\w\>/g, '')
        .replace(/\[\w\w\]/g, '')
      @timing = {
        list: syllables(word) for word in @question.split(" "),
        rate: 1000 * 60 / 2 / 250
      }
      {list, rate} = @timing
      cumulative = cumsum list, rate
      @end_time = @begin_time + cumulative[cumulative.length - 1] + answer_time
      @sync(true)

    skip: ->
      @new_question()

    emit: (name, data) ->
      io.sockets.in(@name).emit name, data

    end_buzz: (session) ->
      #killit, killitwithfire
      if @attempt?.session is session
        @attempt.final = true
        score = checkAnswer @attempt.text, @answer
        @attempt.correct = (score < 2)

        @sync()
        @unfreeze()
        if @attempt.correct
          @set_time @end_time
        @attempt = null #g'bye
        @sync() #two syncs in one request!


    buzz: (user, fn) ->
      if @attempt is null and @time() <= @end_time
        session = Math.random().toString(36).slice(2)
        @attempt = {
          user: user,
          realTime: @serverTime(), # oh god so much time crap
          start: @time(),
          duration: 8 * 1000,
          session, # generate 'em server side 
          text: '',
          final: false
        }
        fn 'http://www.whosawesome.com/'
        @freeze()
        @sync() #partial sync
        @timeout @serverTime, @attempt.realTime + @attempt.duration, =>
          @end_buzz session
      else
        fn 'narp'

    guess: (user, data) ->
      if @attempt?.user is user
        @attempt.text = data.text
        # lets just ignore the input session attribute
        # because that's more of a chat thing since with
        # buzzes, you always have room locking anyway
        if data.final
          # do final stuff
          console.log 'omg final clubs are so cool ~ zuck'
          @end_buzz @attempt.session
        else
          @sync()

    sync: (full) ->
      data = {
        real_time: +new Date,
        voting: {}
      }
      voting = ['skip', 'pause', 'unpause']
      for action in voting
        yay = 0
        nay = 0
        actionvotes = []
        for client in io.sockets.clients(@name)
          vote = client.store.data[action]
          if vote is 'yay'
            yay++
            actionvotes.push client.id
          else
            nay++
        # console.log yay, 'yay', nay, 'nay', action
        if actionvotes.length > 0
          data.voting[action] = actionvotes
        # console.log yay, nay, "VOTES FOR", action
        if yay / (yay + nay) > 0
          client.del(action) for client in io.sockets.clients(@name)
          this[action]()
      blacklist = ["name", "question", "answer", "timing", "voting"]
      for attr of this when typeof this[attr] != 'function' and attr not in blacklist
        data[attr] = this[attr]
      if full
        data.question = @question
        data.answer = @answer
        data.timing = @timing
        data.users = for client in io.sockets.clients(@name)
          {
            id: client.id,
            name: client.store.data.name
          }

      io.sockets.in(@name).emit 'sync', data

  rooms = {}
  io.sockets.on 'connection', (sock) ->
    room = null
    sock.on 'join', (data) ->
      if data.old_socket and io.sockets.socket(data.old_socket)
        io.sockets.socket(data.old_socket).disconnect()

      room_name = data.room_name
      sock.set 'name', data.public_name
      sock.join room_name
      rooms[room_name] = new QuizRoom(room_name) unless room_name of rooms
      room = rooms[room_name]
      room.sync(true)
      room.emit 'introduce', {user: sock.id}

    sock.on 'echo', (data, callback) =>
      callback +new Date

    sock.on 'rename', (name) ->
      sock.set 'name', name
      room.sync(true) if room

    sock.on 'skip', (vote) ->
      sock.set 'skip', vote
      room.sync() if room

    sock.on 'pause', (vote) ->
      sock.set 'pause', vote
      room.sync() if room

    sock.on 'unpause', (vote) ->
      sock.set 'unpause', vote
      room.sync() if room

    sock.on 'buzz', (data, fn) ->
      room.buzz sock.id, fn

    sock.on 'guess', (data) ->
      room.guess sock.id, data

    sock.on 'chat', ({text, final, session}) ->
      room.emit 'chat', {text: text, session:  session, user: sock.id, final: final}

    sock.on 'disconnect', ->
      id = sock.id
      console.log "someone", id, "left"
      setTimeout ->
        console.log !!room, 'rooms'
        if room
          room.sync(true)
          room.emit 'leave', {user: id}
      , 100

  app.get "/multiplayer", (req, res) ->
    people = 'kirk,feynman,huxley,robot,ben,batman,panda,pinkman,superhero,celebrity,traitor,alien,lemon,police,whale,astronaut'
    verb = 'on,enveloping,eating,drinking,in,near,sleeping,destruction,arresting,cloning,around,jumping,scrambling'
    noun = 'mountain,drugs,house,asylum,elevator,scandal,planet,school,brick,lamp,water,paper,friend,toilet,airplane,cow,pony'
    pick = (list) -> 
      n = list.split(',')
      n[Math.floor(n.length * Math.random())]
    console.log(req.params.channel)
    res.redirect '/multiplayer/' + pick(people) + "-" + pick(verb) + "-" + pick(noun)

  app.get "/multiplayer/:channel", (req, res) ->
    name = req.params.channel
    # init_channel name
    res.render 'multiplayer/multiplayer-practice', { name }
