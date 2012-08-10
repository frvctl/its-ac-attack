Question = mongoose.model("Question")
mid = require("../../middleware.coffee")

module.exports = (app) ->
  app.param "searchNext", (req, res, next) ->
    next()

  app.get "/search/:searchNext", mid.userInformation, (req, res) ->
    searchIndx = req.query.searchInput
    pg = req.params
    pgNum = parseInt(pg.searchNext, 10)
    nPerPage = 10
    numToSkip = pgNum*10
    loggedIn = req.loggedIn
    console.log(loggedIn)
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
          limit: nPerPage
        ),((err, question) -> 
         res.render "search/search", {
           title: "Search",
           counter: pgNum,
           lesserIndx: (pgNum * 10),
           greaterIndx: ((pgNum * 10) + 10),
           question: question,
           loggedIn: req.loggedIn,
           userName: req.userName,
           searchIndx: searchIndx
         }
        )
    else
      res.render "search/search", {
        title: "Search",
        question: [],
        counter: pgNum,
        loggedIn: req.loggedIn,
        lesserIndx: (pgNum * 10),
        greaterIndx: (pgNum * 10) + 10,
        userName: req.userName,
        searchIndx: searchIndx
      }
  