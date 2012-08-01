readline = require('readline')
checkAnswer = require('./answerparse').checkAnswer
parseAnswer = require('./answerparse').parseAnswer

nextQuestion = ->
	answer = answers.shift()
	rl.question answer, (resp) ->
		for opt in resp.split(',')
			answ = checkAnswer opt, answer
			console.log "judgement", answ
			console.log "--------------------"
		nextQuestion()
z = (a, b) ->
	console.log checkAnswer a, b

z 'shays rebellion', 'bacons rebellion'
z 'haymarket', 'haymarket square'
z 'feynman', 'richard feynman'
z 'circumsize', 'circumsision'
z 'science', 'scientology'
z 'scientology', 'science'
z 'al gore', 'albert al gore'
z 'cage', 'john cage'
z 'nicolas cage', 'john cage'
z 'locke', 'john locke'
