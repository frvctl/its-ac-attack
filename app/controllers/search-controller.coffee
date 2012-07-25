Question = mongoose.model("Question")

module.exports = (app) ->
  app.param "searchNext", (req, res, next) ->
    next()

  app.get "/search/:searchNext", (req, res) ->
    searchIndx = req.query.searchInput
    pg = req.params
    pgNum = parseInt(pg.searchNext, 10)
    nPerPage = 10
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
         (
          skip: pgNum * 10
          limit: nPerPage
         )
       (err, questions) ->
         res.render "questions/search",
           title: "Search"
           counter: pgNum
           lesserIndx: (pgNum * 10)
           greaterIndx: (pgNum * 10) + 10
           questions: questions
           searchIndx: searchIndx
      res.render "questions/search",
        title: "Search"
        questions: []
        counter: pgNum
        lesserIndx: (pgNum * 10)
        greaterIndx: (pgNum * 10) + 10
        searchIndx: searchIndx
