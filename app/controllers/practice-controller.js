var Question = mongoose.model('Question'),
    questionAns = [];

module.exports = function(app){
  app.get('/practice', function(req, res){
    searchIndx = 'Dickens';
    userAnswer = req.query.answerInput;
    console.log(userAnswer);
    if(searchIndx){
      Question.find({$or :                   // $or is similar to logical || also RegEx allows for partial searchs
        [ {category: {$regex: searchIndx}},  // Searches by categories
          {answer:{$regex: searchIndx}},     // Searches by answers
          {difficulty:{$regex: searchIndx}}, // Searches by difficulty
          {question: {$regex: searchIndx}},  // Searches the question
          {year: {$type: 18}}                // Searches by year
        ] }, function(err, questions){
      console.log(questions);
      res.render('questions/practice', {
        title: 'Practice',
        questions: questions,
        maxNum: 10,
        minNum: 0
        });
      });
    }else{
      res.render('questions/practice', {
        title: 'Practice',
        questions: [],
        maxNum: 10,
        minNum: 0
      });
    }
  });
};