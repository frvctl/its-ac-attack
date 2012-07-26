// Generated by CoffeeScript 1.3.3
(function() {
  var aUser, channel, clear, message, readSpeed, socket;

  aUser = document.getElementById("userName").value;

  channel = document.getElementById("channel").value;

  socket = io.connect("http://localhost:3000");

  console.log("channel " + channel);

  readSpeed = 1000 * 60 / 500;

  socket.on("connect", function() {
    $("#chat").addClass("connected");
    $("#connecting").addClass("hide");
    socket.emit("user", aUser);
    socket.emit("join room", channel);
    clear();
    return $("#chat").addClass("nickname-set");
  });

  socket.on("currentQuestion", function(data) {
    var nextWord, pointer, q, words;
    nextWord = function() {
      var reader;
      $("#question").text(words.slice(0, ++pointer).join(" "));
      $("<span>").css("visibility", "hidden").text(words.slice(pointer).join(" ")).appendTo("#question");
      return reader = setTimeout(nextWord, readSpeed);
    };
    q = data[0];
    words = q.question.split(" ");
    pointer = 0;
    $("#year").text(q.year);
    $("#difficulty").text(q.difficulty);
    $("#category").text(q.category);
    $("#tournament").text(q.tournament);
    $("#answer").text(q.answer);
    return nextWord();
  });

  socket.on("answerResult", function(data) {
    if (data) {
      $("#answer").text("Your answer is correct!");
      return $("#question").text(data[0].question);
    } else {
      return $("#answer").text("Your answer is incorrect =(");
    }
  });

  socket.on("start", function(data) {
    $("#start").addClass("hide");
    $("#information").removeClass("hide");
    $("#buzzer").removeClass("hide");
    return $("#skip").removeClass("hide");
  });

  socket.on("lockout", function(data) {});

  socket.on("theBuzzer", function(data) {
    $("#answerDiv").removeClass("hide");
    $("#skip").addClass("hide");
    return $("#buzzer").addClass("hide");
  });

  socket.on("announcement", function(msg) {
    return $("#lines").append($("<p>").append($("<em>").text(" " + msg + " ")));
  });

  socket.on("names", function(names) {
    var i, _results;
    $("#nicknames").empty().append($("<span>Online: </span>"));
    _results = [];
    for (i in names) {
      _results.push($("#nicknames").append($("<b>").text(" " + names[i] + " ")));
    }
    return _results;
  });

  socket.on("user message", message);

  socket.on("reconnect", function() {
    $("#lines").remove();
    return message("System", "Reconnected to the server");
  });

  socket.on("reconnecting", function() {
    return message("System", "Attempting to re-connect to the server");
  });

  socket.on("error", function(e) {
    return message("System", (e ? e : "A unknown error occurred"));
  });

  $(document).ready(function() {
    var counter;
    counter = 0;
    $("#send-message").submit(function() {
      message("me", $("#message").val());
      socket.emit("user message", $("#message").val());
      clear();
      $("#lines").get(0).scrollTop = 10000000;
      return false;
    });
    $("#answerForm").submit(function(event) {
      event.preventDefault();
      socket.emit("answer", $("#answerInput").val());
      $("#answerDiv").addClass("hide");
      return $("#next").removeClass("hide");
    });
    $("#buzzer").click(function(event) {
      return socket.emit("buzzed", aUser);
    });
    $("#start").click(function(event) {
      return socket.emit("question", questNum);
    });
    return $("#next").click(function(event) {
      clearTimeout(reader);
      counter++;
      socket.emit("question", questNum + counter);
      return $("#next").addClass("hide");
    });
  });

  message = function(from, msg) {
    if (msg.length > 0) {
      return $("#lines").append($("<p>").append($("<b>").text(from + ": "), msg));
    }
  };

  clear = function() {
    return $("#message").val("").focus();
  };

}).call(this);
