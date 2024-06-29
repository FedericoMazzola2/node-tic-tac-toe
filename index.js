
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const rl = createInterface({ input: stdin, output: stdout })

const RUNNING = 'RUNNING';
const PLAYER_X_WINS = 'PLAYER_X_WINS';
const PLAYER_O_WINS = 'PLAYER_O_WINS';
const CATS_GAME  = 'CATS_GAME';

let gameIsOver = false;
let currentPlayer ='Player X';
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

async function startGame() {
    let currentGameState = RUNNING;
    console.log();
    drawGrid(playerXMoves,playerOMoves);
    console.log();

    while (!gameIsOver) {
        
        const response = await rl.question(`${currentPlayer} , please enter your next move: `);
        
        if (isValidInput(response)) {
            let [yMove,xMove]=parseInput(response); //response.split(',').map(x => Number(x));
        
            console.log(`${currentPlayer} entered the move:${response} `);
            let currentPlayerMoves = currentPlayer === 'Player X' ? playerXMoves : playerOMoves;
            currentPlayerMoves[yMove] [xMove] = 1;

            //MAIN GAME LOGIC
            currentPlayer = currentPlayer === 'Player X' ? 'Player O' : 'Player X' ;

            currentGameState = getNextGameState(playerXMoves,playerOMoves);
            gameIsOver = [PLAYER_X_WINS,PLAYER_O_WINS,CATS_GAME].includes(currentGameState);

            console.log();
            drawGrid(playerXMoves,playerOMoves);
            console.log();
        } else{
            console.log(`The:${response} input is Invalid!! `);
        }
        
    }

    if (currentGameState == PLAYER_X_WINS) {
        console.log('Player X is the Winner!!');
    }

    if (currentGameState == PLAYER_O_WINS) {
        console.log('Player O is the Winner!!');
    }

    if (currentGameState == CATS_GAME) {
        console.log('its a tie!!');
    }


    rl.close()
}

function isValidInput(input){
    let [letter,number] = input.split('');
    return ['A','B','C'].includes(letter) && ['1','2','3'].includes(number)
}

function parseInput(input){
    let [letter,number] = input.split('');
    return [
        ['A','B','C'].indexOf(letter),
        ['1','2','3'].indexOf(number),

    ]
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


function drawVerticalLines(xMoves,oMoves,label) {
    let space1Char = xMoves[0] ? 'X' : oMoves[0] ? 'O' : ' ';
    let space2Char = xMoves[1] ? 'X' : oMoves[1] ? 'O' : ' ';
    let space3Char = xMoves[2] ? 'X' : oMoves[2] ? 'O' : ' ';

    console.log(`${label}  ${space1Char} | ${space2Char} | ${space3Char} `);
}

function drawNumberLabels(){
    console.log('   1   2   3')
}

function drawHorizontalLines() {
    console.log('  ---+---+---');
}


function drawGrid(xMoves,oMoves) {
    drawNumberLabels()
    drawVerticalLines(xMoves[0],oMoves[0],'A');
    drawHorizontalLines();
    drawVerticalLines(xMoves[1],oMoves[1],'B');
    drawHorizontalLines();
    drawVerticalLines(xMoves[2],oMoves[2],'C');
}


startGame();

 