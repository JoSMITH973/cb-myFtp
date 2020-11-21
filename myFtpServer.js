const fs = require('fs');
const net = require('net');

const PORT = process.argv[2] || 4242;

const serveur = net.createServer((socket) => {
    console.log('new Connection');
    
    socket.on('data',(data) =>{
        const [directive,parameter,optionnal] = data.toString().split(' ');
        // socket.write('Hello from Server');
        const file = fs.readFileSync('users.json');
        let login = JSON.parse(file);
        let userOk = Boolean;
        userOk = 0;
        switch(directive) {
            case 'HELP':
                socket.write('To check if the user exist : USER <username>\n\r')
                socket.write('To authenticate the user with a password : USER <password>\n\r')
                socket.write('To list the current directory of the server : LIST\n\r')
                socket.write('To change the current directory of the server : CWD <directory>\n\r')
                socket.write('To : transfer a copy of the file FILE from the server to the client : RETR <filename>\n\r')
                socket.write('To transfer a copy of the file FILE from the client to the server : STOR <filename>\n\r')
                socket.write('To display the name of the current directory of the server : PWD\n\r')
                socket.write('To close the connection and stop the program : QUIT')
            break;

            case 'USER':
                let i=0;
                // check if user exist in database
                login.forEach(user => {
                    let toVerif = user["username"];
                    if (toVerif == parameter) {
                        save = i;
                        return userOk = 1;
                    }
                    i++;
                });
                
                // if userOk is true
                if(userOk) {
                    socket.write('user '+parameter+' exist');
                    socket.write('now you have to enter your password');
                    socket.username = parameter;
                    socket.saveid = save;
                    socket.userOk = userOk;
                }
                else {
                    socket.write(parameter+" doesn't exist");
                }
            break;

            case 'PASS':
                console.log(parameter);
                // console.log(socket.saveid);
                // console.log(login[socket.saveid]["password"]);
                if(socket.userOk===1) {
                    if(login[socket.saveid]["password"] == parameter) {
                        socket.passOk = 1;
                        socket.write('Welcome '+socket.username);
                    }
                    else {
                        socket.write('wrong password');
                    }
                }
                else {
                    socket.write("Erreur : Veuillez entrez votre nom d'utilisateur avant")
                    socket.write("utilisez la commande -> USER <username>")
                } 
            break;

            case 'LIST':
                if(socket.passOk==1){
                    let directory = fs.readdirSync('./');
                    socket.write('Files in the current directory :\n\r');
                    directory.forEach(file => {
                        socket.write(file+'\n\r');
                    });
                }
                else {
                    socket.write("You have to authenticate first");
                }
            break;

            case 'CWD':
                if(socket.passOk==1){
                    let directory = fs.readdirSync('./');
                    socket.write('You have successfully change of directory');
                }
                else {
                    socket.write("You have to authenticate first");
                }
            break;
        }
    });
});


serveur.listen(PORT, () => {
    console.log("Server started at http://localhost:",PORT);
});
