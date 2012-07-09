var Question = mongoose.model('Question');

module.exports = function(app){
  app.param('searchNext', function(req, res, next){
    next();
  });

  app.get('/search/:searchNext', function(req, res){
    searchIndx = req.query.searchInput;
    pgNum = req.params;
    console.log(pgNum.searchNext);
    if(pgNum.searchNext < 1){
      currentFirst = 1;
      maxNum = 10;
      minNum = currentFirst - 1;
    }else{
      currentFirst = 5*pgNum.searchNext;
      maxNum = 10*pgNum.searchNext;
      minNum = currentFirst -1;
    }
    if(searchIndx){
      Question.find({$or :                   // $or is similar to logical || also RegEx allows for partial searchs
        [ {category: {$regex: searchIndx}},  // Searches by categories
          {answer:{$regex: searchIndx}},     // Searches by answers
          {difficulty:{$regex: searchIndx}}, // Searches by difficulty
          {question: {$regex: searchIndx}},  // Searches the question
          {year: {$type: 18}}                // Searches by year
        ] }, function(err, questions){
      console.log('pgNum: ' + pgNum.searchNext);
      console.log('currentFirst: ' + currentFirst);
      console.log('maxNum: ' + maxNum);
      console.log('minNum: ' + minNum);
      res.render('questions/search', {
        title: 'Search',
        questions: questions,
        counter: 0,
        currentFirst: currentFirst,
        maxNum: maxNum,
        minNum: minNum
      });
    });
  }else{
      res.render('questions/search', {
        title: 'Search',
        questions: [],
        counter: 0,
        currentFirst: currentFirst,
        maxNum: maxNum,
        minNum: minNum
      });
    }
  });
};