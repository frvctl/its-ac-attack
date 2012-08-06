do ->
	removeDiacritics = require('./removeDiacritics').removeDiacritics
	damlev = require('./levenshtein').levenshtein
	stopwords = 'dont,accept,either,underlined,prompt,on,in,to,the,of,is,a,read,mentioned,before,that,have,word,equivalents,forms,jr,sr,dr,phd,etc,a'.toLowerCase().split(',')


	parseAnswer = (answer) ->
		answer = answer.replace(/[\[\]\<\>\{\}][\w\-]+?[\[\]\<\>\{\}]/g, '')

		clean = (part.trim() for part in answer.split(/[^\w]and[^\w]|[^\w]or[^\w]|\[|\]|\{|\}|\;|\,|\<|\>|\(|\)/g))
		clean = (part for part in clean when part isnt '')
		pos = []
		neg = []
		for part in clean 
			part = removeDiacritics(part) #clean out some non-latin characters
			part = part.replace(/\"|\'|\“|\”|\.|’|\:/g, '')
			part = part.replace(/-/g, ' ')

			if /equivalent|word form|other wrong/.test part
				# console.log 'equiv-', part
			else if /do not|dont/.test part
				# console.log 'neg-', part
				neg.push part
			else if /accept/.test part 
				comp = part.split(/before|until/)
				if comp.length > 1
					neg.push comp[1]
				pos.push comp[0]
				# console.log 'pos-', comp
			else
				pos.push part
		[pos, neg]


	checkAnswer = (compare, answer) ->
		compare = removeDiacritics(compare).trim().split ' '
		[pos, neg] = parseAnswer(answer.trim())

		accepts = []

		for p in pos
			list = (word for word in p.split(/\s/) when word.toLowerCase().trim() not in stopwords and word.trim() isnt '')

			if list.length > 0
				# console.log list
				sum = 0	

				p2 = for word in compare
					scores = for index in [0...list.length]
						score = damlev list[index].toLowerCase(), word.toLowerCase()
						if list[index].toLowerCase()[0] != word.toLowerCase()[0]
							score += 2 #first letters count a lot
						if list[index].toLowerCase()[1] != word.toLowerCase()[1]
							score += 1 #second letters count quite a bit too
						[index, score]
					sorted = scores.sort ([w,a], [z,b]) -> a - b
					index = sorted[0][0]
					weight = 1
					weight = 1.5 if index is 0
					weight = 1.5 if index is list.length - 1
					weighted = list[index].length - Math.pow(sorted[0][1], 1.0) * weight
					# console.log "first", list[index], index, sorted[0][1], weighted
					sum += weighted
				accepts.push [list, sum]

		max = accepts.sort ([w,a], [z,b]) -> b - a

		str = max[0][0]
		len = str.join('').length
		score = max[0][1]
		console.log str, score, compare.join(' ')

		if score > len * 0.6 or score > 5
			return true

		return false

	exports.checkAnswer = checkAnswer
	exports.parseAnswer = parseAnswer