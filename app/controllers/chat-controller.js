// var Chat = mongoose.model('Chat');

module.exports = function(app){
//   var io = require('socket.io').listen(app);

//   io.sockets.on('connection', function(socket){

//     socket.on('login attempt', function(data){
//       session.login(io, socket, data);
//     });

//     socket.on('logout attempt', function(data){
//       session.logout(io, socket, data);
//     });

//     socket.on('message', function(data){
//       message.message(io, socket, data);
//     });

//     socket.on('disconnect', function(data){
//       session.disconnect(io, socket, data);
//     });
//   });

//   app.get('/chat', function(req, res, io, socket, data){
//     User.findOne({socket_id: socket.id
//     }, function(err, doc){
//       if(err){
//         socket.emit('error', {
//           message: 'error reading clients list'
//         });
//         return;
//       }

//       if(!doc){
//         socket.emit('message error', {
//           message: 'client not found'
//         });
//         return;
//       }

//       var message = {
//         nickname: doc.nickname,
//         message: data.message
//       };

//       io.sockets.emit('message', message);
//     });

//     res.render('chat/main', {
//       title: 'Chat'
//      });
//   });

//   app.get('/chat/login', function(req, res, io, socket, data){
//     if(!data.nickname){
//       socket.emit('error', {
//         message: 'no nickname provided'
//       });
//       return;
//     }

//     Chat.findOne({nickname:data.nickname
//     }, function(err, doc){
//       if(err){
//         socket.emit('error', {
//           message: 'error reading clients list'
//         });
//         return;
//       }

//       if(doc){
//         console.warn('nickname in use, orphan records?', doc.nickname);

//       socket.emit('login error', {
//         message: 'nickname in use'
//       });

//       var client = new Chat();

//       client.nickname = data.nickname;
//       client.socket_id = socket.id;

//       client.save(function(){
//         socket.emit('login ok', {
//           nickname: data.nickname
//         });

//         exports.clients(io, socket);
//      });
//   	res.render('chat/main', {
//   		title: 'Chat'
//   	})
};