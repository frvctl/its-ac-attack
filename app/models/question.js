// Search schema

var Question = new Schema({
    _id : Schema.ObjectId
  , category : String
  , pKey : String
  , difficulty : String
  , tournament : String
  , question : String
  , accept : String
  , question_num : Number
  , year : Number
  , answer : String
  , round : String
});

mongoose.model('Question', Question)