var Question = mongoose.model('Question'),
    mid = require('../../middleware.js');

module.exports = function(app){
  var ansIsTrue = false,
      promptIsTrue = false,
      afterPromp = false;
  app.get('/practice', mid.assignUserName, function(req, res){
    searchIndx = 'History';
    userAnswer = req.query.answerInput;
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
      res.render('questions/practice', {
        title: 'Practice',
        questions: questions,
        wordsToRead: questionSplit,
        isTrue: ansIsTrue,
        userName: req.userName
        });
      })
    );
    }else{
      res.render('questions/practice', {
        title: 'Practice',
        questions: [],
        wordsToRead: questionSplit,
        isTrue: ansIsTrue,
        userName: req.userName
      });
    }
  });
};