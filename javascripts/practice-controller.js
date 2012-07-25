var Question = mongoose.model('Question');

module.exports = function(app){

  app.param('nextQuestion', function(req, res, next){
    next();
  });

  app.get('/practice/:nextQuestion', function(req, res){
    var searchIndx = 'History';
    var ques = req.params;
    var quesNum = parseInt(ques.nextQuestion, 10);
    var userAnswer = req.params.question;
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
          }
        }
      res.render('questions/practice', {
        title: 'Practice',
        counter: quesNum,
        questions: questions,
        question: question,
        ansTruth: ansTruth
        });
      });
    }else{
      res.render('questions/practice', {
        title: 'Practice',
        counter: quesNum,
        questions: [],
        question: question,
        ansTruth: ansTruth
      });
    }
  });
};