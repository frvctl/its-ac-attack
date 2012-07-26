aUser = document.getElementById("userName").value
channel = document.getElementById("channel").value
socket = io.connect("http://localhost:3000")
console.log "channel " + channel
readSpeed = 1000 * 60 / 500

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
