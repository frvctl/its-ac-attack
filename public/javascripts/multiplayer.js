var socket = io.connect();
var aUser = document.getElementById("userName").value;
var questNum = document.getElementById("questionNumber").value;
var reading;


socket.on('connect', function () {
  $('#chat').addClass('connected');
  $('#connecting').addClass('hide');
  socket.emit('user', aUser);
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
    reading = setTimeout(nextWord, 1000*60/500);
  }
  nextWord();
});

socket.on('answerResult', function(data){
  $(document).ready(function(){
    if(data){
      $('#answer').text('Your answer is correct!');
      $("#question").text(data[0].question);
    }else{
      $('#answer').text('Your answer is incorrect =(');
      nextWord();
    }
  });
});

socket.on('theBuzzer', function(data){
  console.log('theBuzzer recieved' + data);
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

// Send messages
$(document).ready(function(){
  $('#send-message').submit(function () {
    message('me', $('#message').val());
    socket.emit('user message', $('#message').val());
    clear();
    $('#lines').get(0).scrollTop = 10000000;
    return false;
  });
});

// Submitting Answers
$(document).ready(function(){
  $('#answerForm').submit(function(event){
    event.preventDefault();
    socket.emit('answer', $('#answerInput').val());
    $('#answerDiv').addClass("hide");
    $('#nextQuestionButton').removeClass("hide");
  });
});

// Buzzer
$(document).ready(function(){
  $("#buzzer").click(function(event){
    socket.emit('buzzed', aUser);
    clearTimeout(reading);
    $("#answerDiv").removeClass("hide");
    $("#buzzer").addClass("hide");
  });
});

$(document).ready(function(){
  $('#start').click(function(event){
    socket.emit('question', questNum);
    $("#buzzer").removeClass("hide");
    $("#skip").removeClass("hide");
  });
});



function message (from, msg) {
  $('#lines').append($('<p>').append($('<b>').text(from), msg));
}

function clear () {
    $('#message').val('').focus();
}

