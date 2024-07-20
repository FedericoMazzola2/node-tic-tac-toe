import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
 
let app = express();
let server = http.createServer(app)
let io = new Server(server);

const WAITING = 'WAITING';
const RUNNING = 'RUNNING';
const PLAYER_X_WINS = 'PLAYER_X_WINS';
const PLAYER_O_WINS = 'PLAYER_O_WINS';
const CATS_GAME  = 'CATS_GAME'

let games = [];

function createNewGame(){   
    return {
        playerXMoves:[
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ],        
        playerOMoves : [
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ],
        currentPlayer : null,
        gameIsOver : false,              
        playerXSocket : null,
        playerOSocket : null,
        currentGameState : WAITING,
    }
}


let nextSocketId = 0;

io.on('connection', socket => {
    let socketID = nextSocketId;
    nextSocketId +=1;

    let waitingGame = games.find(game => game.currentGameState === WAITING);
    let game;
    
    if (waitingGame){
        game=waitingGame;
        console.log('A second player has joined! START the game...');
        game.playerOSocket=socket;
        game.playerXSocket.emit('info',`A second player has joined ! You\'re play against:${socketID}.Time to START the game!`)
        game.playerOSocket.emit('info',`You are the second player,your Id is:${socketID} and you are playing against:${game.playerXId}. the game will now START!`)
        game.playerOId = socketID;
        startGame(game);
    } else {       
        let newGame = createNewGame();
        game=newGame;
        console.log('The first player has joined! Wait for second player..,');
        game.playerXSocket=socket; 
        game.playerXSocket.emit('info',`You are the first player,your Id is:${socketID}. Wait for second player..`);
        game.playerXId = socketID;
        games.push(game);
    }
    

    socket.on("new move" , input => {
        
        let {
            playerXMoves,
            playerOMoves,
            playerXSocket,
            playerOSocket
        } = game;

        let [yMove,xMove]=parseInput(input);        

        
        if (!positionIsOpen(yMove,xMove,playerXMoves,playerOMoves)) {
            let currentPlayerSocket = game.currentPlayer === 'Player X' ? playerXSocket : playerOSocket;
            return currentPlayerSocket.emit('position taken')
        }
        let currentPlayerMoves = game.currentPlayer === 'Player X' ? game.playerXMoves : game.playerOMoves;
        currentPlayerMoves[yMove] [xMove] = 1;

        game.currentGameState = getNextGameState(playerXMoves,playerOMoves);
        game.gameIsOver = [PLAYER_X_WINS,PLAYER_O_WINS,CATS_GAME].includes(game.currentGameState);

        playerXSocket.emit('player moves',{playerXMoves,playerOMoves});
        playerOSocket.emit('player moves',{playerXMoves,playerOMoves});

        game.currentPlayer = game.currentPlayer === 'Player X' ? 'Player O' : 'Player X' ;

        if(!game.gameIsOver) {
            if (game.currentPlayer==='Player X'){          
                playerXSocket.emit('your turn');
                playerOSocket.emit('other player turn');       
            } else {
                playerOSocket.emit('your turn');
                playerXSocket.emit('other player turn');  
            }      
            
        } else {         
            if (game.currentGameState === PLAYER_X_WINS) {
                playerXSocket.emit('win');
                playerOSocket.emit('lose');
            } else if (game.currentGameState === PLAYER_O_WINS) {        
                playerOSocket.emit('win');
                playerXSocket.emit('lose');               
            } else if (game.currentGameState === CATS_GAME){
                playerXSocket.emit('tie');
                playerOSocket.emit('tie');
            }

            games = games.filter(g => g !== game);

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


function startGame(game) {
    let {
        playerXMoves,
        playerOMoves,
        playerXSocket,
        playerOSocket
    } = game;

    game.currentGameState= RUNNING;
    console.log('The game has started!!');
    
    playerXSocket.emit('player moves',{playerXMoves,playerOMoves});
    playerOSocket.emit('player moves',{playerXMoves,playerOMoves});
    game.currentPlayer = Math.random() > 0.5 ? 'Player X' : 'Player O';
  
    if (game.currentPlayer==='Player X'){
        playerXSocket.emit('your turn');
        playerOSocket.emit('other player turn');       
    } else {
        playerOSocket.emit('your turn');
        playerXSocket.emit('other player turn');  
    }
   

}  

function getNextGameState(xMoves,oMoves){
    let playerXWins = isHorizontalWin(xMoves) || isVerticalWin(xMoves) || isDiagonalWin(xMoves) || isCornerWin(xMoves);
    
    if (playerXWins) {
        return PLAYER_X_WINS;
    }

    let playerOWins = isHorizontalWin(oMoves) || isVerticalWin(oMoves) || isDiagonalWin(oMoves) || isCornerWin(oMoves);
    
    if (playerOWins) {
        return PLAYER_O_WINS;
    }

    let catsGame = isCatsGame(xMoves,oMoves);

    if (catsGame) {
        return CATS_GAME;
    }

    return RUNNING;

}


function positionIsOpen(row,column,playerXMoves,playerOMoves){
    return !playerXMoves[row][column] && !playerOMoves[row][column];
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


function isCatsGame(xMoves,oMoves){
    
    return xMoves.every((row,rowNumber) =>{
        return row.every((_,columnNumber) => {
            return oMoves[rowNumber][columnNumber] || xMoves[rowNumber][columnNumber];
        });
    })
   
}