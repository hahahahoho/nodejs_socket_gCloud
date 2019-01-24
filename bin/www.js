//!/usr/bin/env node
/**
 * Module dependencies.
 */
const app = require('../app');
const debug = require('debug')('nodeservertest2:server');
const http = require('http');


/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '65080');
//const port = 65080;
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}



const io = require('socket.io')(server);
//실제 채팅구현
const channel = ["channel01", "channel02", "channel03", "admin"];
for(var i = 0 ; i<channel.length; i++){
    io.of(`/${channel[i]}`).on('connection', function(socket){
        console.log('client connected');
        socket.myChannel = socket.adapter.nsp.name;
        console.log(socket.myChannel);
        //룸 접속
        socket.on('joinRoom', (data)=>{
            //새로운 room 이름 받고 저장
            socket.myRoom = data.roomNum;
            //room 생성 및 접속
            socket.join(socket.myRoom);
            data.entry = `${data.name}님이 ${socket.myRoom}방에 입장하셨습니다.`
            io.of(socket.myChannel).to(socket.myRoom).emit('roomEntryMsg', data.entry);
        });
        //룸 아웃
        socket.on('outRoom', (data)=>{
            console.log(socket.myRoom);
            if(socket.myRoom != null && socket.myRoom != '' && socket.myRoom != undefined){
                socket.leave(socket.myRoom);
                data.out = `${data.name}님이 ${socket.myRoom}방에서 퇴장하셨습니다.`
                io.of(socket.myChannel).to(socket.myRoom).emit('roomExitMsg', data.out);
            }
        });
        //room user 채팅
        socket.on('roomChat', (data)=>{
            //socket.emit('roomChatMsg', data);
            io.of(socket.myChannel).to(socket.myRoom).emit('roomChatMsg', data);
        });
        //관리자메시지
        socket.on('adminMsg', function(data){
            try{
                if(data.channel != null && data.channel != undefined && data.channel != ""){
                    if(data.room != null && data.room != undefined && data.room != ""){
                        console.log('ch');
                        io.of(data.channel).to(data.room).emit('getAdminMsg', data);   
                    }else{
                        console.log('room');
                        io.of(data.channel).emit('getAdminMsg', data);
                    }    
                }else{
                    console.log('all');
                    for(var j=0; j<channel.length-1; j++){
                        io.of(channel[j]).emit('getAdminMsg', data);
                    }
                } 
                io.of('/admin').emit('sendMsgResult', "전송성공");
            }catch(error){
                io.of('/admin').emit('sendMsgResult', "전송실패");
            }
            
            
        });
        
        
        //연결해제
        socket.on('disconnect', () => {
            console.log('client disconnected');
        });
        /*socket.on('서버에서 받을 이벤트명', function(데이터) {
            // 받은 데이터 처리
            socket.emit('서버로 보낼 이벤트명', 데이터);
        });*/
    })

}