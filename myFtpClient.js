const fs = require('fs');
const net = require('net');
const readline = require('readline');
const PORT = process.argv[2] || 4242;
const client = new net.Socket();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

client.connect(PORT, '127.0.0.1',() => {
    console.log('connected');
        rl.on('line', (input) =>{
            // console.log(input);
            // client.write('USER JoSmith');
            client.write(input);
            if (input == "QUIT") {
                console.log("Good Bye !")
                process.exit();
            }
        });
})

client.on('data',(data) =>{
    console.log(data.toString());
})