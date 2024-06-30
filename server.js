import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
 
let app = express();
let server = http.createServer(app)
let io = new Server(server);


let currentPlayer ;
let playerXMoves = [
    [0,0,0],
    [0,0,0],
    [0,0,0],
];

let playerOMoves = [
    [0,0,0],
    [0,0,0],
    [0,0,0],
];


let playerX;
let playerO;

io.on('connection', socket => {
    
    if (playerX){
        playerO=socket;
        console.log('A second player has joined! START the game...');
        playerX.emit('info','A second player has joined.Time to START the game!')
        playerO.emit('info','You are the second player , the game will now START!')

        startGame();
    } else {
        playerX=socket;   
        console.log('The first player has joined! Wait for second player..,');
        playerX.emit('info','You are the first player. Wait for second player..')
    }
    

    socket.on("new move" , input => {
        let [yMove,xMove]=parseInput(input);        
        let currentPlayerMoves = currentPlayer === 'Player X' ? playerXMoves : playerOMoves;
        currentPlayerMoves[yMove] [xMove] = 1;

        playerX.emit('player moves',{playerXMoves,playerOMoves});
        playerO.emit('player moves',{playerXMoves,playerOMoves});

        currentPlayer = currentPlayer === 'Player X' ? 'Player O' : 'Player X' ;

        if (currentPlayer==='Player X'){
            playerX.emit('your turn');
            playerO.emit('other player turn');       
        } else {
            playerO.emit('your turn');
            playerX.emit('other player turn');  
        }
    
    });
  
});

server.listen(process.env.PORT || 8080 , () => {
    console.log('Server is listening on port:' + (process.env.PORT || 8080));
});

function parseInput(input){
    let [letter,number] = input.split('');
    return [
        ['A','B','C'].indexOf(letter),
        ['1','2','3'].indexOf(number),

    ]
}


function startGame() {
    console.log('The game has started!!');
    
    playerX.emit('player moves',{playerXMoves,playerOMoves});
    playerO.emit('player moves',{playerXMoves,playerOMoves});
    currentPlayer = Math.random() > 0.5 ? 'Player X' : 'Player O';
  
    if (currentPlayer==='Player X'){
        playerX.emit('your turn');
        playerO.emit('other player turn');       
    } else {
        playerO.emit('your turn');
        playerX.emit('other player turn');  
    }
   

}  

