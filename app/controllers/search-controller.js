var Question = mongoose.model('Question');

module.exports = function(app){
  app.param('searchNext', function(req, res, next){
    next();
  });

  app.get('/search/:searchNext', function(req, res){
    var searchIndx = req.query.searchInput;
    var pg = req.params;
    var pgNum = parseInt(pg.searchNext, 10);
    var nPerPage = 10;
    if(searchIndx){
      Question.find({$or :                     // $or is similar to logical || also RegEx allows for partial searchs
          [ {category: {$regex: searchIndx}},  // Searches by categories
            {answer:{$regex: searchIndx}},     // Searches by answers
            {difficulty:{$regex: searchIndx}}, // Searches by difficulty
            {year: {$type: 18}}                // Searches by year
          ] }, [], {skip: pgNum*10, limit:nPerPage},
          (function(err, questions){
                res.render('questions/search', {
                  title: 'Search',
                  counter: pgNum,
                  questions: questions,
                  searchIndx: searchIndx
            });
          })
        );
    }else{
      res.render('questions/search', {
        title: 'Search',
        questions: [],
        counter: pgNum,
        searchIndx:searchIndx
      });
    }
  });
};