aUser = document.getElementById("userName").value
socket = io.connect().of(channel_name)

sync_offset = 0
currentQuestion = null
lastTime = null
revealDelay = null
tableOwner = null
isCompleted = false
timeFreeze = false
identifier = Math.random().toString(36).slice(3)
currentGuess = ""

socket.on "connect", ->
  $("#chat").addClass "connected"
  $("#connecting").addClass "hide"
  socket.emit "user", aUser
  socket.emit "join room", channel
  clear()
  $("#chat").addClass "nickname-set"

socket.on "currentQuestion", (data) ->
  nextWord = ->
    $("#question").text words.slice(0, ++pointer).join(" ")
    $("<span>").css("visibility", "hidden").text(words.slice(pointer).join(" ")).appendTo "#question"
    reader = setTimeout(nextWord, readSpeed)
  q = data[0]
  words = q.question.split(" ")
  pointer = 0
  $("#year").text q.year
  $("#difficulty").text q.difficulty
  $("#category").text q.category
  $("#tournament").text q.tournament
  $("#answer").text q.answer
  nextWord()

socket.on "answerResult", (data) ->
  if data
    $("#answer").text "Your answer is correct!"
    $("#question").text data[0].question
  else
    $("#answer").text "Your answer is incorrect =("

socket.on "start", (data) ->
  $("#start").addClass "hide"
  $("#information").removeClass "hide"
  $("#buzzer").removeClass "hide"
  $("#skip").removeClass "hide"

socket.on "lockout", (data) ->

socket.on "theBuzzer", (data) ->
  $("#answerDiv").removeClass "hide"
  $("#skip").addClass "hide"
  $("#buzzer").addClass "hide"

socket.on "announcement", (msg) ->
  $("#lines").append $("<p>").append($("<em>").text(" " + msg + " "))

socket.on "names", (names) ->
  $("#nicknames").empty().append $("<span>Online: </span>")
  for i of names
    $("#nicknames").append $("<b>").text(" " + names[i] + " ")

socket.on "user message", message
socket.on "reconnect", ->
  $("#lines").remove()
  message "System", "Reconnected to the server"

socket.on "reconnecting", ->
  message "System", "Attempting to re-connect to the server"

socket.on "error", (e) ->
  message "System", (if e then e else "A unknown error occurred")

$(document).ready ->
  counter = 0
  $("#send-message").submit ->
    message "me", $("#message").val()
    socket.emit "user message", $("#message").val()
    clear()
    $("#lines").get(0).scrollTop = 10000000
    false

  $("#answerForm").submit (event) ->
    event.preventDefault()
    socket.emit "answer", $("#answerInput").val()
    $("#answerDiv").addClass "hide"
    $("#next").removeClass "hide"

  $("#buzzer").click (event) ->
    socket.emit "buzzed", aUser

  $("#start").click (event) ->
    socket.emit "question", questNum

  $("#next").click (event) ->
    clearTimeout reader
    counter++
    socket.emit "question", questNum + counter
    $("#next").addClass "hide"

message = (from, msg) ->
  $("#lines").append $("<p>").append($("<b>").text(from + ": "), msg)  if msg.length > 0
clear = ->
  $("#message").val("").focus()

generateName = ->
  adjective = 'aberrant,agressive,warty,hoary,breezy,dapper,edgy,feisty,gutsy,hardy,intrepid,jaunty,karmic,lucid,maverick,natty,oneric,precise,quantal'
  animal = 'axolotl,warthog,hedgehog,badger,drake,fawn,gibbon,heron,ibex,jackalope,koala,lynx,meerkat,narwhal,ocelot,penguin,quetzal,kodiak,cheetah,puma,jaguar,panther,tiger,leopard,lion'
  pick = (list) -> 
    n = list.split(',')
    n[Math.floor(n.length * Math.random())]
  pick(adjective) + " " + pick(animal)

publicname = generateName()

serverTime = ->
  if timeFreeze
    return timeFreeze
  else
    return +new Date - sync_offset

cumsum = (list, rate) ->
  sum = 0
  for num in list
    sum += Math.round(num) * rate #always round!

countDuration = 0
countStart = 0 #note! not server time!

stateUpdater = ->
  if currentQuestion
    timeDelta = serverTime() - lastTime
    # percent = Math.max(0, percent)
    # percent = Math.min(1, percent) #make sure everything's in range
    words = currentQuestion.question.split(" ")
    {list, rate} = currentQuestion.timing
    cumulative = cumsum(list, rate)

    index = 0
    index++ while timeDelta > cumulative[index]
    index++
    if isCompleted
      index = cumulative.length
      reveal = 0
    else  
      endTimes = cumulative[cumulative.length - 1] # 2012
      reveal = endTimes + revealDelay + lastTime - serverTime()
    document.querySelector('#answer').innerText = currentQuestion.answer
    if reveal <= 0
      document.querySelector('#answer').style.visibility = ''
    else
      document.querySelector('#answer').style.visibility = 'hidden'

    reveal = Math.max(0, reveal)
    document.querySelector('#reveal').innerText = (reveal / 1000).toFixed(1)
    # if timeDelta > endTimes
    #   document.querySelector('#reveal').style.display = ''
    # else
    #   document.querySelecztor('#reveal').style.display = 'none'


    # index = Math.round(words.length * percent)
    document.querySelector("#visible").innerText = words.slice(0, index).join(' ') + " "
    document.querySelector("#unread").innerText = words.slice(index).join(' ')

  ms = Math.max(0, countDuration - (new Date - countStart))
  countdown = (ms / 1000).toFixed(1)
  # countdown = "0" + countdown if ms < 10000
  # countdown = ":" + countdown
  if countDuration > 0
    document.querySelector('#countdown').style.display = ''
    if tableOwner is publicname
      document.querySelector('#countdown').innerText = countdown
    else
      document.querySelector('#countdown').innerText = countdown + ' ' + tableOwner + ": " + currentGuess
  else
    document.querySelector('#guess').style.display = "none"
    document.querySelector('#countdown').style.display = 'none'

setInterval stateUpdater, 50

synchronize = (data) ->
  # console.log "sync", data
  if data.question
    currentQuestion = data.question

  sync_offset = +new Date - data.time
  countDuration = data.countDuration
  countStart = +new Date #client time, not sever time!
  lastTime = data.lastTime
  revealDelay = data.revealDelay
  # nextTime = data.nextTime
  timeFreeze = data.timeFreeze
  tableOwner = data.tableOwner
  currentGuess = data.guess
  isCompleted = data.completed
  stateUpdater()

socket.on 'sync', synchronize

socket.on 'disconnect', ->
  document.querySelector('#disco').style.display = ''
  document.querySelector('#main').style.display = 'none'

testLatency = ->
  initialTime = +new Date
  socket.emit 'echo', {}, (firstServerTime) ->
    recieveTime = +new Date
    socket.emit 'echo', {}, (secondServerTime) ->
      secondTime = +new Date
      CSC1 = recieveTime - initialTime
      CSC2 = secondTime - recieveTime
      SCS1 = secondServerTime - firstServerTime
      console.log CSC1, SCS1, CSC2
      # recieveTime - initialTime = Client -> Server -> Client
      # secondTime - recieveTime = Client -> Server -> Client
      # secondServerTime - firstServerTime = Server -> Client -> Server

document.addEventListener 'keydown', (e) ->
  if tableOwner is publicname
    # dont do anything
  else if e.keyCode is 13
    socket.emit 'buzz', {name: publicname, id: identifier}, (status) ->
      if status is "who's awesome? you are!"
        document.querySelector('#guess').style.display = ""
        document.querySelector('#guess').value = ""
        document.querySelector('#guess').focus()
      console.log "current state", status
    console.log "pressed enter"
  else if e.keyCode is 90
    socket.emit 'unpause', "because the universe makes no sense", (status) ->
      console.log "pause permissions", status
  else if e.keyCode is 80
    socket.emit 'pause', "because the universe makes no sense", (status) ->
      console.log "unpause permissions", status
  else if e.keyCode is 83
    socket.emit 'skip', "because the universe makes no sense", (status) ->
      console.log "skip permissions", status

document.addEventListener 'keyup', (e) ->
  if document.activeElement.id is "guess" and tableOwner is publicname
    typing = document.querySelector('#guess').value
    if e.keyCode is 13 and typing #no blank answers?
      socket.emit 'guess', {guess: typing, final: true}, (status) ->
        console.log "guess final", status
      document.body.focus()
    else
      socket.emit 'guess', {guess: typing, final: false}, (status) ->
        # console.log "guess", status