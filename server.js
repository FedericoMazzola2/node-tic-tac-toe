import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
 
let app = express();
let server = http.createServer(app)
let io = new Server(server);

let playerX;
let playerO;


io.on('connection', socket => {
    
    if (playerX){
        playerO=socket;
        console.log('A second player has joined! START the game...');
        playerX.emit('info','A second player has joined.Time to START the game!')
        playerO.emit('info','You are the second player , the game will now START!')
    } else {
        playerX=socket;   
        console.log('The first player has joined! Wait for second player..,');
        playerX.emit('info','You are the first player. Wait for second player..')
    }
    
   // socket.emit('your turn');
  //  socket.on('new message', message => {     
       // console.log(`The client says: ${message} `);
        //io.emit('incoming message' , message);
       // socket.broadcast.emit('incoming message' , message);
   // });
    
});

server.listen(process.env.PORT || 8080 , () => {
    console.log('Server is listening on port:' + (process.env.PORT || 8080));
})