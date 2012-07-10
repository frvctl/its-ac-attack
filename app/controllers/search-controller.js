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
            {tournament:{$regex: searchIndx}}, // Searches by tournament
            {year: {$type: 18}}                // Searches by year
          ] }, {category:1,answer:1,           // Fields which are specified to return info
                difficulty:1,question:1,       // all other fields are now undefind
                year:1, tournament:1},
               {skip: pgNum*10, limit:nPerPage},
          (function(err, questions){
                res.render('questions/search', {
                  title: 'Search',
                  counter: pgNum,
                  lesserIndx: (pgNum*10),
                  greaterIndx: (pgNum*10)+10,
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
        lesserIndx: (pgNum*10),
        greaterIndx: (pgNum*10)+10,
        searchIndx:searchIndx
      });
    }
  });
};