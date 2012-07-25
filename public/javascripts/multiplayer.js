var aUser = document.getElementById("userName").value;
var channel = document.getElementById("channel").value;
var socket = io.connect('http://localhost:3000');
console.log('channel ' + channel);
var readSpeed = 1000*60/500;

/*
 * Currently:
 * ---------------------------------------------------------------------------
 * On connect -> emit user information
 * On currentQuestion -> Read the question out. Question is sent from the server
 * On answerResult -> Display whether the answer is correct or not
 * On start -> Change the display(pure jQuery)
 * On lockout -> Nothing~~~
 * On theBuzzer -> Change the displayer(pure jQuery)
 * On <chatFunction> -> Chat stuff
 */


socket.on('connect', function () {
  $('#chat').addClass('connected');
  $('#connecting').addClass('hide');
  socket.emit('user', aUser);
  socket.emit('join room', channel);
  clear();
  $('#chat').addClass('nickname-set');
});

socket.on('currentQuestion', function(data){
  var q = data[0];
  var words = q.question.split(" ");
  var pointer = 0;
  $("#year").text(q.year);
  $("#difficulty").text(q.difficulty);
  $("#category").text(q.category);
  $("#tournament").text(q.tournament);
  $("#answer").text(q.answer);
  function nextWord(){
    $("#question").text(words.slice(0, ++pointer).join(" "));
    $("<span>").css("visibility", "hidden").text(words.slice(pointer).join(" ")).appendTo("#question");
    reader = setTimeout(nextWord, readSpeed);
  }
  nextWord();
});

socket.on('answerResult', function(data){
  if(data){
    $('#answer').text('Your answer is correct!');
    $("#question").text(data[0].question);
  }else{
    $('#answer').text('Your answer is incorrect =(');
  }
});

socket.on('start', function(data){
  $('#start').addClass("hide");
  $('#information').removeClass("hide");
  $("#buzzer").removeClass("hide");
  $("#skip").removeClass("hide");
});


socket.on('lockout', function(data){

});

socket.on('theBuzzer', function(data){
    $("#answerDiv").removeClass("hide");
    $('#skip').addClass("hide");
    $("#buzzer").addClass("hide");
});

// General Announcements
socket.on('announcement', function (msg) {
  $('#lines').append($('<p>').append($('<em>').text(" " + msg + " ")));
});

//
socket.on('names', function (names) {
  $('#nicknames').empty().append($('<span>Online: </span>'));
  for (var i in names) {
    $('#nicknames').append($('<b>').text(" " + names[i] + " "));
  }
});

socket.on('user message', message);

socket.on('reconnect', function () {
  $('#lines').remove();
  message('System', 'Reconnected to the server');
});

socket.on('reconnecting', function () {
  message('System', 'Attempting to re-connect to the server');
});

socket.on('error', function (e) {
  message('System', e ? e : 'A unknown error occurred');
});

$(document).ready(function(){
  var counter = 0;

  // Send messages
  $('#send-message').submit(function () {
    message('me', $('#message').val());
    socket.emit('user message', $('#message').val());
    clear();
    $('#lines').get(0).scrollTop = 10000000;
    return false;
  });

  // Submitting Answers
  $('#answerForm').submit(function(event){
    event.preventDefault();
    socket.emit('answer', $('#answerInput').val());
    $('#answerDiv').addClass("hide");
    $('#next').removeClass("hide");
  });

  // Buzzer
  $("#buzzer").click(function(event){
    socket.emit('buzzed', aUser);
  });

  // Start the question
  $('#start').click(function(event){
    socket.emit('question', questNum);
  });

  $('#next').click(function(event){
    clearTimeout(reader);
    counter++;
    socket.emit('question', questNum+counter);
    $('#next').addClass('hide');
  });
});



function message (from, msg) {
  if(msg.length > 0){
    $('#lines').append($('<p>').append($('<b>').text(from + ": "), msg));
  }
}

function clear () {
    $('#message').val('').focus();
}

