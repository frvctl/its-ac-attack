var mongoose = require('mongoose');

// Search schema

var Chat = new Schema({
    _id : mongoose.Schema.ObjectId,
    socket_id: String,
    nickname : String
});

mongoose.model('Chat', Chat);