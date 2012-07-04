var Question = mongoose.model('Question')
  , db = config.db.uri
  , questions = [];

function getJson(categoryIndx){
	Question.find({category: categoryIndx}, function(err, items){
      questions = items;
      console.log("Error "+ err);
    });
}

module.exports = function(app){
  app.get('/search', function(req, res){
    getJson('Trash');
    res.render('questions/search', {
      title: 'Search',
      questions: questions
    });
  });
};

