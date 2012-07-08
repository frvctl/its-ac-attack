var Question = mongoose.model('Question'),
    currentFirst = 1,
    maxNum = 10;

module.exports = function(app){
  app.get('/search', function(req, res){
    searchIndx = req.query.searchInput;
    if(searchIndx){
      Question.find({$or :                   // $or is similar to logical || also RegEx allows for partial searchs
        [ {category: {$regex: searchIndx}},  // Searches by categories
          {answer:{$regex: searchIndx}},     // Searches by answers
          {difficulty:{$regex: searchIndx}}, // Searches by difficulty
          {question: {$regex: searchIndx}},  // Searches the question
          {year: {$type: 18}}                // Searches by year
        ] }, function(err, questions){
      res.render('questions/search', {
        title: 'Search',
        questions: questions,
        currentFirst: currentFirst,
        maxNum: maxNum,
        minNum: currentFirst - 1
        });
      });
    }else{
      res.render('questions/search', {
        title: 'Search',
        questions: [],
        currentFirst: currentFirst,
        maxNum: maxNum,
        minNum: currentFirst - 1
      });
    }
  });
};