mongoose = require("mongoose")

Question = new Schema(
  _id: mongoose.Schema.ObjectId
  category: String
  pKey: String
  difficulty: String
  tournament: String
  question: String
  accept: String
  question_num: Number
  year: Number
  answer: String
  round: String
)

mongoose.model "Question", Question
