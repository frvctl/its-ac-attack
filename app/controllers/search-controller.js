var Question = mongoose.model('Question');

module.exports = function(app){
  app.get('/search', function(req, res){
    searchIndx = req.query.searchInput;
    if(searchIndx){
    Question.find({$or :                  // $or is similar to logical || also RegEx allows for partial searchs
      [ {category: {$regex: searchIndx}}  // Searches by Categories
      , {answer:{$regex: searchIndx}}     // Searches by Answers
      , {difficulty:{$regex: searchIndx}} // Searches by Difficulty
      ] }, function(err, questions){      // Searches by Year
    res.render('questions/search', {
      title: 'Search',
      questions: questions
      });
    });
    }else{
      res.render('questions/search', {
        title: 'Search',
        questions: []
      });
    }
  });
};