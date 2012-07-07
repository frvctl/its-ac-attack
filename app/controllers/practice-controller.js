module.exports = function(app){
	app.get('/practice', function(req, res){
		res.render('questions/practice', {
			title: 'Practice'
		});
	});
  };