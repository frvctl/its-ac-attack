var Question = mongoose.model('Question'),
    mid = require('../../middleware.js');

module.exports = function(app){
  var io = require('socket.io').listen(app),
      ansIsTrue = false,
      promptIsTrue = false,
      afterPromp = false;
  app.get('/multiplayer', mid.assignUserName, function(req, res){
    io.sockets.on('connection', function (socket) {
        
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
      });

      socket.on('disconnect', function () {
        //logic here
      });
    });

  searchIndx = 'History';
  userAnswer = req.query.answerInput;
  if(req.loggedIn){
    if(req.session.auth.twitter){
      loggedInUsers = req.session.auth.twitter.user.name;
    }else{
      loggedInUsers = req.session.auth.facebook.user.name;
    }
  }else{
    loggedInUsers = 'None';
  }
  loggedIn = req.session.auth;
  if(searchIndx){
    Question.find({$or :                   // $or is similar to logical || also RegEx allows for partial searchs
      [ {category: {$regex: searchIndx}},  // Searches by categories
        {answer:{$regex: searchIndx}},     // Searches by answers
        {difficulty:{$regex: searchIndx}}, // Searches by difficulty
        {tournament:{$regex: searchIndx}}, // Searches by tournament
        {year: {$type: 18}}                // Searches by year
      ] }, {category:1, answer:1,          // Fields which are specified to return info
            difficulty:1, question:1,      // all other fields are now undefind
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
      loggedIn: loggedIn,
      loggedInUsers: loggedInUsers,
      isTrue: ansIsTrue,
      userName: req.userName
      });
     })
   );
  }else{
    res.render('multiplayer/multiplayer-practice', {
      title: 'Multiplayer',
      questions: [],
      wordsToRead: questionSplit,
      buzzTrue: false,
      loggedIn: loggedIn,
      loggedInUsers: loggedInUsers,
      isTrue: ansIsTrue,
      userName: req.userName
    });
   }
 });
};