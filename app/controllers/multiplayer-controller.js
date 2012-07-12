var Question = mongoose.model('Question');

module.exports = function(app){
  var io = require('socket.io').listen(app),
      nicknames = {};

  io.sockets.on('connection', function (socket) {

    /* 
     * There is a lot to be done in this area of the app so 
     * I am going to have a long comment with ToDo's and other
     * things so that I can flesh out the multiplayer component
     * and get myself on the right track. 
     * 
     * The first thing that HAS to be done is a way to retrieve
     * all users who are currently logged into the application
     * and then display then in a list *(for now)*. Once I do this
     * A lot more can be done.
     *
     * TODO:
     * -- Get the users currently logged into the application and 
     *    displayer them
     * -- Determine if more than one controller is needed to handle 
     *    multiplayer. As in maybe a practice controller, a chat
     *    controller and a buzzer controller... something to con
     *    sider anyway.
     */
    
    /* 
     * When a user hits the buzzer button, broadcast the name of
     * the user who pressed it and lock all other users out. 
     */
    socket.on('buzzer pressed', function(buzz){
      // logic here
    });

    /*
     * When a user answers the question, check the answer - which
     * is handled outside of this logic, then broadcast the result
     * and if is correct move on to the next question and alot point
     * to the user who got the answer correct.
     */
    socket.on('answer submitted', function(ans){
      // logic here
    })

    socket.on('user message', function (msg) {
      socket.broadcast.emit('user message', socket.nickname, msg);
    });

    socket.on('nickname', function (nick, fn) {
      if (nicknames[nick]) {
        fn(true);
      } else {
        fn(false);
        nicknames[nick] = socket.nickname = nick;
        socket.broadcast.emit('announcement', nick + ' connected');
        io.sockets.emit('nicknames', nicknames);
      }
    });

    socket.on('disconnect', function () {
      if (!socket.nickname) return;

      delete nicknames[socket.nickname];
      socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
      socket.broadcast.emit('nicknames', nicknames);
    });
  });

  var ansIsTrue = false,
      promptIsTrue = false,
      afterPromp = false;
  app.get('/multiplayer', function(req, res){
    searchIndx = 'History';
    userAnswer = req.query.answerInput;
    var loggedInUsers = [];
    if(req.session.auth.twitter.user.name){
      loggedInUsers.push(req.session.auth.twitter.user.name);
    }else if(req.session.auth.twitter.user.name 
                && req.session.auth.facebook.user.name){
      loggedInUsers.push(req.session.auth.twitter.user.name);
      loggedInUsers.push(req.session.auth.facebook.user.name);
    }else{
      console.log('wtf');
    }
    console.log(loggedInUsers);
    if(searchIndx){
      Question.find({$or :                     // $or is similar to logical || also RegEx allows for partial searchs
          [ {category: {$regex: searchIndx}},  // Searches by categories
            {answer:{$regex: searchIndx}},     // Searches by answers
            {difficulty:{$regex: searchIndx}}, // Searches by difficulty
            {tournament:{$regex: searchIndx}}, // Searches by tournament
            {year: {$type: 18}}                // Searches by year
          ] }, {category:1, answer:1,           // Fields which are specified to return info
                difficulty:1, question:1,       // all other fields are now undefind
                year:1, tournament:1},
               {skip: 1, limit:1},
          (function(err, questions){
            var questionSplit = questions[0].question.split(" ");
            var regexMatch = questions[0].answer
                                .match(/(.*?)( \[(.*)\])?$/);
            var theAns = regexMatch[1];             // First index is everything outside of brackets
            var insideBrackets = regexMatch[3];     // Third is everything inside brackets
            if(regexMatch === null) throw "shitstorm";
            if(insideBrackets === null) throw "nothing in brackets";
            if(userAnswer){
              if(userAnswer.toLowerCase() === theAns.toLowerCase()){
                ansIsTrue = true;
              }else{
                ansIsTrue = false;
              }
            }
      res.render('multiplayer/multiplayer-practice', {
        title: 'Multiplayer',
        questions: questions,
        wordsToRead: questionSplit,
        buzzTrue: false,
        loggedInUsers: loggedInUsers,
        isTrue: ansIsTrue
        });
      })
    );
    }else{
      res.render('multiplayer/multiplayer-practice', {
        title: 'Multiplayer',
        questions: [],
        wordsToRead: questionSplit,
        buzzTrue: false,
        loggedInUsers: loggedInUsers,
        isTrue: ansIsTrue
      });
    }
  });
};