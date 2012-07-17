var Question = mongoose.model('Question'),
    Chat = mongoose.model('Chat'),
    mid = require('../../middleware.js');

/*
 * This function is responsible for fetching the question information from the
 * server and allowing it to be sent to the client. The secondary purpose of
 * this function is checking answers and returning either true or false, if the
 * first argument is defined.
 */
function getNextQuestionAndCheckAnswer(theAnswer, callback){
  searchIndx = 'History';
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
           {skip: 1, limit:1},
      function(err, question){
    callback(question);
    if(theAnswer){
      var ansTruth;
      var regexMatch = question[0].answer
                      .match(/(.*?)( \[(.*)\])?$/);
      var theAns = regexMatch[1];             // First index is everything outside of brackets
      var insideBrackets = regexMatch[3];     // Third is everything inside brackets
      if(regexMatch === null) throw "shitstorm";
      if(insideBrackets === null) throw "nothing in brackets";
      if(theAnswer){
        if(theAnswer.toLowerCase() === theAns.toLowerCase()){
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
      users = {};

  io.configure('development', function(){
    io.set('log level', 2);
  });

  io.configure('production', function(){
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.enable('browser client gzip');
    io.set('log level', 1);
  });

  io.sockets.on('connection', function (socket) {
    socket.on('user message', function (msg) {
       socket.broadcast.emit('user message', socket.name, msg);
    });
   
    socket.on('user', function(name, fn){
      if(users[name]){
        fn(true);
        console.log('nickname in use, function returned true')
      }else{
        fn(false);
        users[name] = socket.name = name;
        socket.broadcast.emit('announcement', name + ' connected');
        socket.emit('names', users);
      }
    });
    

    /*
     * On the initial connection get the question and send it back to the client
     * side for rendering
     */
    getNextQuestionAndCheckAnswer(null, function(question){
      socket.emit('question',  question);
    });

    /*
     * Listens for when a user hits the buzzer, at which point we send who hit
     * the button back to the client side so that all other users can be
     * informed, the timer can start for the answering user, and all other users
     * can be locked out
     */
    socket.on('buzzed', function(data){
      socket.emit('', data);
    });

    /*
     * When a user answers the question, check the answer, then send the result
     * back to the client side for further processing
     */
    socket.on('answer', function(data){
      getNextQuestionAndCheckAnswer(data, function(theTruth){
        socket.emit('answerResult', theTruth);
      });
    });


    socket.on('disconnect', function () {
       if (!socket.name) return;

       delete users[socket.name];
       socket.broadcast.emit('announcement', socket.name + ' disconnected');
       socket.broadcast.emit('nicknames', users);
    });
  });
  
  /*
   * the nextQuestion param allows for the current question to be determined and
   * therefore provides an easy way to know both on the client and server side
   * which question is being handled. The param will the questions id within the
   * database.
   */
  app.param('nextQuestion', function(req, res, next){
    next();
  });

  /*
   * Handles the multiplayer view rendering and some session based user authoriz
   * ation.
   */
  app.get('/multiplayer/:nextQuestion', mid.assignUserName, function(req, res){
    if(req.loggedIn){
      res.render('multiplayer/multiplayer-practice', {
        title: 'Multiplayer',
        loggedIn: req.session.auth,
        userName: req.userName,
        nextQuestion: req.params.nextQuestion
        });
    }else{
      res.render('multiplayer/multiplayer-practice', {
        title: 'Multiplayer',
        loggedIn: req.session.auth,
        userName: req.userName,
        nextQuestion: req.params.nextQuestion
      });
     }
   });
};