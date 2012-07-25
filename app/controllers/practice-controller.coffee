Question = mongoose.model("Question")

module.exports = (app) ->
  app.param "nextQuestion", (req, res, next) ->
    next()

  app.get "/practice/:nextQuestion", (req, res) ->
    searchIndx = "History"
    ques = req.params
    quesNum = parseInt(ques.nextQuestion, 10)
    userAnswer = req.params.question
    if searchIndx
      Question.find
        $or: [
          category:
            $regex: searchIndx
        ,
          answer:
            $regex: searchIndx
        ,
          difficulty:
            $regex: searchIndx
        ,
          tournament:
            $regex: searchIndx
        ,
          year:
            $type: 18
         ],
      (
        category: 1
        answer: 1
        difficulty: 1
        question: 1
        year: 1
        tournament: 1
      )
      ( skip: numToSkip
        limit: 1
      )
      (err, question) ->
        if userAnswer
          ansTruth = undefined
          regexMatch = question[0].answer.match(/(.*?)( \[(.*)\])?$/)
          theAns = regexMatch[1]
          insideBrackets = regexMatch[3]
          throw "shitstorm"  if regexMatch is null
          throw "nothing in brackets"  if insideBrackets is null
          if userAnswer
            if userAnswer.toLowerCase() is theAns.toLowerCase()
              ansTruth = true
            else
              ansTruth = false
        res.render "questions/practice",
          title: "Practice"
          counter: quesNum
          questions: questions
          question: question
          ansTruth: ansTruth
      res.render "questions/practice",
        title: "Practice"
        counter: quesNum
        questions: []
        question: question
        ansTruth: ansTruth
