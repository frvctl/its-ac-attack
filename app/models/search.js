// Search schema

var Search = new Schema({
    _id          : {type : Schema.ObjectId}
  , category     : {type : String}
  , difficulty   : {type : String}
  , year         : {type : String}
  , round        : {type: String}
  , question     : {type: String}
});

mongoose.model('Search', Search)