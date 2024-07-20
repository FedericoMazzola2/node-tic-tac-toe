import socketIoClient from 'socket.io-client';
import * as readline from 'node:readline/promises';


const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  };

let rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout,
});

let localServer =true 

let serverUrl = localServer     ///process.env.IS_DEV
    ? "http://127.0.0.1:8080"
    : "https//heroku.com"

let socket = socketIoClient(serverUrl);


//socket.on('your turn', async() => {
     
    //console.log(`\nReceived a message: ${data}`);
    //process.stdout.write('Enter a message and hit "Enter" to send: ');
//});


socket.on('info', message => {
    console.log(message );
});

socket.on('player moves',({playerXMoves,playerOMoves}) => {
    drawGrid(playerXMoves,playerOMoves);

});


async function getNextMove(prompt){

    let inputValid = false;
    let response;

    while (!inputValid){
        response = await rl.question(prompt);
        inputValid=isValidInput(response);
    }
    if (!inputValid) {
        console.log("Invalid input value!!!")
    }
    socket.emit("new move",response);
}

socket.on('your turn', () => {
    getNextMove('It\'s your turn now. Please enter your next move: ');
});


socket.on('position taken', () => {
    console.log("Sorry, that position is taken !!");
    getNextMove('Please choose another (empty) position: ');
 });



socket.on('other player turn', () => {
   console.log("Wait for the other player\'s input")
});

socket.on('win', () => {
     console.log("The game is over ! You win!!");
     rl.close();
     socket.disconnect();
});

socket.on('lose', () => {
    console.log("The game is over ! You lost!!");
    rl.close();
    socket.disconnect();
});

socket.on('tie', () => {
    console.log("The game is over ! It\'s a tie.");
    rl.close();
    socket.disconnect();
});



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
    console.log();
    drawNumberLabels()
    drawVerticalLines(xMoves[0],oMoves[0],'A');
    drawHorizontalLines();
    drawVerticalLines(xMoves[1],oMoves[1],'B');
    drawHorizontalLines();
    drawVerticalLines(xMoves[2],oMoves[2],'C');
    console.log();
}

function isValidInput(input){
    let [letter,number] = input.split('');
    return ['A','B','C'].includes(letter) && ['1','2','3'].includes(number)
}

