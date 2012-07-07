var Question = mongoose.model('Question')
  , questions = []
  , searchIndx = '';

module.exports = function(app){
  function getJson(searchIndx){
      Question.find({$or :                    // $or is similar to logic OR also RegEx allows for partial searchs
          [{category: {$regex: searchIndx}}   // Searches by Categories
          , {answer:{$regex: searchIndx}}     // Searches by Answers
          , {difficulty:{$regex: searchIndx}} // Searches by Difficulty
            ]}, function(err, items){         // Searches by Year
        questions = items;
        console.log("Error "+ err);
      });
  }

    app.get('/search', function(req, res){
      searchIndx = req.query.searchInput;
      if(req.query.searchInput){
        getJson(searchIndx);
      }else{
        searchIndx = '';
      }
      res.render('questions/search', {
        title: 'Search',
        questions: questions
      });
   });
 };
