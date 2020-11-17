const fs = require('fs');
const net = require('net');

const PORT = process.argv[2] || 4242;

const serveur = net.createServer((socket) => {
    console.log('new Connection');
    
    socket.on('data',(data) =>{
        const [directive,parameter] = data.toString().split(' ');
        socket.write('Hello from Server');
        
        switch(directive) {
            case 'USER':
                const file = fs.readFileSync('users.json');
                let login = JSON.parse(file);
                console.log(parameter);

                login.forEach(user => {
                    console.log(user["username"]);
                    // user == 
                });
                // console.log(login[1]["username"]);

                // checkLogin = login["username"];
                // check if user exist in database
                
                // if(checkLogin) {
                    // if true
                    socket.write(parameter+' successfuly connected')
                // }
                // else {
                //     socket.write('Your username is unknowed')
                // }
            break;
        }
    });
});


serveur.listen(PORT, () => {
    console.log("Server started at http://localhost:",PORT);
});
