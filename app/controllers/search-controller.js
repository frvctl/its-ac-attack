var Search = mongoose.model('Search');

module.exports = function(app){
  app.get('/search', function(req, res){
    res.render('questions/search', {
      title: 'Search'
    });
  });
};

