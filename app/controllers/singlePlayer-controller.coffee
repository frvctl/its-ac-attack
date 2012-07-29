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
  app.param "searchNext", (req, res, next) ->
    next()

  app.param "questionNext", (req, res, next) ->
    next()

  app.get "/search/:searchNext", (req, res) ->
    searchIndx = req.query.searchInput
    pgNum = parseInt(req.params.searchNext, 10)
    numToSkip = 1
    getNextQuestion(numToSkip, searchIndx, (question) ->
      if question
        res.render "singlePlayer/search",
          title: "Search",
          counter: pgNum,
          lesserIndx: (pgNum * 10),
          greaterIndx: (pgNum * 10) + 10,
          question: question
          searchIndx: searchIndx
    )

  app.get "/practice", (req, res) ->
    res.render "singlePlayer/practice"
      title: "practice"