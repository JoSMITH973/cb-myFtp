const fs = require('fs');
const net = require('net');
const readline = require('readline');

const host = process.argv[2] || '127.0.0.1';
const PORT = process.argv[3] || 4242;

const client = new net.Socket();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
let username;
client.connect(PORT, host,() => {
    console.log('connected');
        rl.on('line', (input) =>{
            // console.log(input);
            // client.write('USER JoSmith');
            client.write(input);

            if(input.slice(0,4) == 'USER'){
                username = input.slice(4);
                console.log(username);
            }

            if (input == "QUIT") {
                console.log("Good Bye !")
                process.exit();
            }
        });
})

client.on('data',(data) =>{
    console.log(data.toString());
})