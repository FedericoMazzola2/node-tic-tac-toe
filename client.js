import socketIoClient from 'socket.io-client';
import * as readline from 'node:readline/promises';


const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  };

let rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout,
});

let socket = socketIoClient('http://127.0.0.1:8080');


socket.on('your turn', async() => {
    let response = await rl.question('It\'s your turn now. Please enter your next move:');  
    //console.log(`\nReceived a message: ${data}`);
    //process.stdout.write('Enter a message and hit "Enter" to send: ');
});


socket.on('info', message => {
       
    console.log(message );
    
});




async function StartApp() {
    while (true){
    
        let response = await rl.question('Enter a message and hit "Enter" to send: ');       
        //let delayres = await delay(3000); 
        socket.emit("new message",response);
         
    };

};


 
//StartApp();