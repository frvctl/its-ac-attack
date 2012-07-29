Question = mongoose.model("Question")

getNextQuestion: (numToSkip, searchIndx, callback) ->
  if searchIndx
    Question.find
      $or: [
          (category: $regex: searchIndx)
        , (answer: $regex: searchIndx)
        , (difficulty: $regex: searchIndx)
        , (tournament: $regex: searchIndx)
        , (year: $type: 18)
        ],(
          category: 1
          answer: 1
          difficulty: 1
          question: 1
          year: 1
          tournament: 1
        ),(
          skip: numToSkip
          limit: 1
        ),((err, question) -> 
          callback question
        )
        
module.exports = (app) ->
  app.param "nextQuestion", (req, res, next) ->
    next()

  app.get "/practice/:nextQuestion", (req, res) ->
    searchIndx = "History"
    numToSkip = 1
    ques = req.params
    quesNum = parseInt(ques.nextQuestion, 10)
    userAnswer = req.params.question
    if searchIndx
      Question.find
        $or: [
          (category: $regex: searchIndx)
        , (answer: $regex: searchIndx)
        , (difficulty: $regex: searchIndx)
        , (tournament: $regex: searchIndx)
        , (year: $type: 18)
        ],(
          category: 1
          answer: 1
          difficulty: 1
          question: 1
          year: 1
          tournament: 1
        ),(
          skip: numToSkip
          limit: 1
        ),((err, question) -> 
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
          res.render "question/practice",
            title: "Practice"
            counter: quesNum
            question: question
            ansTruth: ansTruth
        )
    else
      res.render "question/practice",
        title: "Practice"
        counter: quesNum
        question: []
        ansTruth: ansTruth
