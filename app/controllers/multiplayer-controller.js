var Question = mongoose.model('Question'),
    Chat = mongoose.model('Chat');
    
/* ------------------------------------------------------------------------------ *\
 * Overview:                                                                      *
 * ===========                                                                    *
 * This function is responsible for fetching the question information from the    *
 * server and allowing it to be sent to the client. The secondary purpose of      *
 * this function is checking answers and returning either true or false, if the   *
 * first argument is defined. The numToSkip argument allows the next question     *
 * to be accessed. The searchIndx argument allows questions from a different      *
 * search to be accessed.                                                         *
 * -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-  *
 * Arguments:                                                                     *
 * ============                                                                   *
 * userAnswer -> Accepts a string only, used to check the submitted answer and    *
 *               return either true - the answer is true - or false - the answer  *
 *               is false                                                         *
 * numToSkip -> Must be an integer, simply the number of questions from the first *
 *              that will be skipped over, see the mongodb docs for more info on  *
 *              how this works                                                    *
 * searchIndx -> Must be a string, the search method used to retrieve quesitons   *
 * callback -> A generic call back to get the information, will either return a   *
 *             question - callback(question) - or a boolean that represents the   *
 *             truth of an answer.                                                *
\* ------------------------------------------------------------------------------ */
function getNextQuestionAndCheckAnswer(userAnswer, numToSkip, searchIndx, callback){
  if(searchIndx){                          // RegEx provides for partial searching
    Question.find({$or :                   // $or is similar to logical ||
      [ {category: {$regex: searchIndx}},  // Searches by categories
        {answer:{$regex: searchIndx}},     // Searches by answers
        {difficulty:{$regex: searchIndx}}, // Searches by difficulty
        {tournament:{$regex: searchIndx}}, // Searches by tournament
        {year: {$type: 18}}                // Searches by year
      ] }, {category:1, answer:1,          // Fields which are specified to return info
            difficulty:1, question:1,      // all other fields are now undefind
            year:1, tournament:1},
           {skip: numToSkip, limit:1},
      function(err, question){
    callback(question);
    if(userAnswer){
      var ansTruth;
      var regexMatch = question[0].answer
                      .match(/(.*?)( \[(.*)\])?$/);
      var theAns = regexMatch[1];             // First index is everything outside of brackets
      var insideBrackets = regexMatch[3];     // Third is everything inside brackets
      if(regexMatch === null) throw "shitstorm";
      if(insideBrackets === null) throw "nothing in brackets";
      if(userAnswer){
        if(userAnswer.toLowerCase() === theAns.toLowerCase()){
          ansTruth = true;
        }else{
          ansTruth = false;
        }
        callback(ansTruth);
        }
      }
    });
  }
}

module.exports = function(app){
  var io = require('socket.io').listen(app),
      users = {},
      channelState = {};
  
  /*
   * Configures socket.io for different Node.js enviromental variables. Production
   * lowers the logging to an absolute minimum and disables client gzip which
   * causes problems with this version of node as well as a few other things to
   * increase performance.
   */
  io.configure('development', function(){
    io.set('log level', 2);
  });

  io.configure('production', function(){
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.disable('browser client gzip');
    io.set('transports', ["xhr-polling"]);
    io.set('polling duration', 10);
    io.set('log level', 1);
  });

  io.sockets.on('connection', function (socket) {
    socket.questNum = 0;

   /*
    * On a user message - as in when the chat form submits - emit to everyone except
    * the client who sent the message the name of the person sending the message
    * and the message content.
    */
    socket.on('user message', function (msg) {
       socket.broadcast.emit('user message', socket.name, msg);
    });
   
    /*
     * On a connection user is emited, at which point the user is checked against
     * those who are already in the users object, if they are the users are emited
     * back to the client who connected, if they are not in the users object they
     * are added to it and an announcement is made to all users of the person who
     * connected. Also the users are emited to every client.
     */
    socket.on('user', function(name){
      if(users[name]){
        socket.emit('names', users);
      }else{
        users[name] = socket.name = name;
        socket.broadcast.emit('announcement', name + ' connected');
        io.sockets.emit('names', users);
      }
    });

    /*
     * On a question - as in when the start question button is pressed - the current
     * question is fetched from the server using the getNextQuestion.. method and
     * it is then emited to every client.
     */
    socket.on('question', function(questNum){
      getNextQuestionAndCheckAnswer(null, questNum, 'History', function(question){
        socket.quesNum = questNum;
        io.sockets.emit('start', question);
        io.sockets.emit('currentQuestion',  question);
      });
    });
    
    /*
     * Listens for when a user hits the buzzer, at which point we send who hit
     * the button back to the client side so that all other users can be
     * informed, the timer can start for the answering user, and all other users
     * can be locked out
     */
    socket.on('buzzed', function(data){
      io.sockets.emit('announcement', data + ' pressed the buzzer');
      socket.broadcast.emit('lockout', data);
      socket.emit('theBuzzer', data);
    });

    /*
     * When a user answers the question, check the answer, then send the result
     * back to the client side for further processing
     */
    socket.on('answer', function(data){
      console.log(socket.quesNum);
      getNextQuestionAndCheckAnswer(data, socket.quesNum, 'History', function(theTruth){
        socket.emit('answerResult', theTruth);
      });
    });

    /*
     * Handles disconnection by deleting the disconnected user from the users object
     * and telling all other clients that the user disconnected while also sending
     * the new users object to all clients.
     */
    socket.on('disconnect', function () {
       if (!socket.name) return;
       delete users[socket.name];
       socket.broadcast.emit('announcement', socket.name + ' disconnected');
       io.sockets.emit('names', users);
    });
  });
  
 /*
  * Write a comment here
  */
  app.param('channel', function(req, res, next){
    next();
  });
  

  app.get('/multiplayer', mid.userInformation, function(req, res){
    if(req.loggedIn){
      res.render('multiplayer/multiplayer-selectRoom', {
        title: 'Select Room'
      });
    }else{
      res.render('users/notAuthorized', {
        title: 'Select Room'
      });
      }
    });

  /*
   * Handles the multiplayer view rendering and some session based user authoriz
   * ation that is accessed through request(req).
   */
  app.get('/multiplayer/:channel', function(req, res){
    if(req.loggedIn){
      res.render('multiplayer/multiplayer-practice', {
        title: 'Multiplayer',
        loggedIn: req.session.auth
        });
    }else{
      req.flash("info", "You are not authorized");
      res.redirect('/login');     }
   });
};