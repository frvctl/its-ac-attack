var Question = mongoose.model('Question'),
    counter = 0;

module.exports = function(app){
  app.param('searchNext', function(req, res, next){
    next();
  });

  app.get('/search/:searchNext', function(req, res){
    var searchIndx = req.query.searchInput;
    var pg = req.params;
    var pgNum = pg.searchNext;
    var nPerPage = 10;
    if(searchIndx){
      Question.find({$or :                     // $or is similar to logical || also RegEx allows for partial searchs
          [ {category: {$regex: searchIndx}},  // Searches by categories
            {answer:{$regex: searchIndx}},     // Searches by answers
            {difficulty:{$regex: searchIndx}}, // Searches by difficulty
            {question: {$regex: searchIndx}},  // Searches the question
            {year: {$type: 18}}                // Searches by year
          ] }, [], {skip: pgNum*10, limit:nPerPage},
          (function(err, questions){
                res.render('questions/search', {
                  title: 'Search',
                  counter: 0,
                  questions: questions,
                  searchIndx: searchIndx
            });
          })
        );
    }else{
      res.render('questions/search', {
        title: 'Search',
        questions: [],
        counter: 0,
        searchIndx:searchIndx
      });
    }
  });
};