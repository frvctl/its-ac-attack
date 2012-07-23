var Question = mongoose.model('Question');

module.exports = function(app){

  app.param('nextQuestion', function(req, res, next){
    next();
  });

  app.get('/practice/:nextQuestion', function(req, res){
    var searchIndx = 'History';
    var userAnswer = req.query.answerInput;
    var ansIsTrue = false;
    var ansIsFalse = false;
    var i = 0;
    var wordArray = [];
    var ques = req.params;
    var quesNum = parseInt(ques.nextQuestion, 10);
    if(searchIndx){
      Question.find({$or :                     // $or is similar to logical || also RegEx allows for partial searchs
          [ {category: {$regex: searchIndx}},  // Searches by categories
            {answer:{$regex: searchIndx}},     // Searches by answers
            {difficulty:{$regex: searchIndx}}, // Searches by difficulty
            {tournament:{$regex: searchIndx}}, // Searches by tournament
            {year: {$type: 18}}                // Searches by year
          ] }, {category:1,answer:1,           // Fields which are specified to return info
                difficulty:1,question:1,       // all other fields are now undefind
                year:1, tournament:1},
               {skip: quesNum, limit:1},
          (function(err, questions){
            var questionSplit = questions[0]
                                  .question.split(" ");
            
            function blah(){
              if(questionSplit[i] !== undefined){
                wordArray = questionSplit.slice(0, i++);
                setTimeout(function(){blah();}, 1000);
              }
            }

            blah();

            console.log(wordArray);

            var regexMatch = questions[0].answer
                              .match(/(.*?)( \[(.*)\])?$/);
            var theAns = regexMatch[1];             // First index is everything outside of brackets
            var insideBrackets = regexMatch[3];     // Third is everything inside brackets
            if(regexMatch === null) throw "shitstorm";
            if(insideBrackets === null) throw "nothing in brackets";
            if(userAnswer){
              if(userAnswer.toLowerCase() === theAns.toLowerCase()){
                ansIsTrue = true;
                ansIsFalse = false;
                req.params = ques + 1;
              }else{
                ansIsFalse = true;
                ansIsTrue = false;
              }
            }
      res.render('questions/practice', {
        title: 'Practice',
        counter: quesNum,
        questions: questions,
        wordsToRead: questionSplit,
        isTrue: ansIsTrue,
        isFalse: ansIsFalse,
        userName: req.userName
        });
      })
    );
    }else{
      res.render('questions/practice', {
        title: 'Practice',
        counter: quesNum,
        questions: [],
        wordsToRead: questionSplit,
        isTrue: ansIsTrue,
        userName: req.userName
      });
    }
  });
};