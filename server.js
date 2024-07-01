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

const RUNNING = 'RUNNING';
const PLAYER_X_WINS = 'PLAYER_X_WINS';
const PLAYER_O_WINS = 'PLAYER_O_WINS';
const CATS_GAME  = 'CATS_GAME'

let playerX;
let playerO;
let currentGameState = RUNNING;
let gameIsOver = false;

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

        currentGameState = getNextGameState(playerXMoves,playerOMoves);
        gameIsOver = [PLAYER_X_WINS,PLAYER_O_WINS,CATS_GAME].includes(currentGameState);

        playerX.emit('player moves',{playerXMoves,playerOMoves});
        playerO.emit('player moves',{playerXMoves,playerOMoves});

        currentPlayer = currentPlayer === 'Player X' ? 'Player O' : 'Player X' ;

        if(!gameIsOver) {
            if (currentPlayer==='Player X'){          
                playerX.emit('your turn');
                playerO.emit('other player turn');       
            } else {
                playerO.emit('your turn');
                playerX.emit('other player turn');  
            }      
            
        } else {         
            if (currentGameState === PLAYER_X_WINS) {
                playerX.emit('win');
                playerO.emit('lose');
            } else if (currentGameState === PLAYER_O_WINS) {        
                playerO.emit('win');
                playerX.emit('lose');               
            } else {
                playerX.emit('tie');
                playerO.emit('tie');
            }

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

function getNextGameState(xMoves,oMoves){
    let playerXWins = isHorizontalWin(xMoves) || isVerticalWin(xMoves) || isDiagonalWin(xMoves) || isCornerWin(xMoves);
    let playerOWins = isHorizontalWin(oMoves) || isVerticalWin(oMoves) || isDiagonalWin(oMoves) || isCornerWin(oMoves);

    if (playerXWins) {
        return PLAYER_X_WINS;
    }

    if (playerOWins) {
        return PLAYER_O_WINS;
    }

    return RUNNING;

}

function isHorizontalWin(moves){
    //moves.some(row => console.log(row));
    return moves.some(row => row.every (x=> x===1));
}

function isVerticalWin(moves){
    return [0,1,2].some(columnNumber => moves.every(row => row[columnNumber]===1)); 
}

function isDiagonalWin(moves){
     return (moves[0][0] === 1 && moves[1][1] === 1 && moves[2][2] === 1)
     || (moves[0][2] === 1 && moves[1][1] === 1 && moves[2][0] === 1);
}

function isCornerWin(moves){
    return (moves[0][0] === 1 && moves[0][2] === 1 && moves[2][0] === 1 && moves[2][2] === 1 );
}
