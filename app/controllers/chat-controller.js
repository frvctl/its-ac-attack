var Chat = mongoose.model('Chat'),
    mid = require('../../middleware.js');

module.exports = function(app){
  var io = require('socket.io').listen(app),
      nicknames = {};

  io.sockets.on('connection', function (socket) {
    socket.on('user message', function (msg) {
      socket.broadcast.emit('user message', socket.nickname, msg);
    });

    socket.on('nickname', function (nick, fn) {
      if (nicknames[nick]) {
        fn(true);
      } else {
        fn(false);
        nicknames[nick] = socket.nickname = nick;
        socket.broadcast.emit('announcement', nick + ' connected');
        io.sockets.emit('nicknames', nicknames);
      }
    });

    socket.on('disconnect', function () {
      if (!socket.nickname) return;

      delete nicknames[socket.nickname];
      socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
      socket.broadcast.emit('nicknames', nicknames);
    });
  });
};