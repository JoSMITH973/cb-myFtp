const fs = require('fs');
const net = require('net');
const process = require('process');
const path = require('path');
const { match } = require('assert');

const PORT = process.argv[2] || 4242;

const serveur = net.createServer((socket) => {
    console.log('new Connection');
    
    socket.on('data',(data) =>{
        const [directive,parameter,optionnal] = data.toString().split(' ');
        // socket.write('Hello from Server');
        const ufile = fs.readFileSync('./users.json');
        let login = JSON.parse(ufile);
        let userOk = Boolean;
        userOk = 0;
        // Début Déboggage | Pour éviter de s'authentifier
            // socket.username = "Joan";
            // socket.passOk=1;
        // Fin déboggage
        switch(directive) {
            case 'HELP':
                socket.write('USER <username> : To check if the user exist\n\r')
                socket.write('USER <password> : To authenticate the user with a password\n\r')
                socket.write('LIST : To list the current directory of the server\n\r')
                socket.write('CWD <directory> : To change the current directory of the server\n\r')
                socket.write('RETR <filename> : To : transfer a copy of the file FILE from the server to the client\n\r')
                socket.write('STOR <filename> : To transfer a copy of the file FILE from the client to the server\n\r')
                socket.write('PWD : To display the name of the current directory of the server\n\r')
                socket.write('QUIT : To close the connection and stop the program')
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
                    socket.write('user '+parameter+' exist\r');
                    socket.write('now you have to enter your password with the command PASS');
                    socket.username = parameter;
                    socket.saveid = save;
                    socket.userOk = userOk;
                }
                else {
                    socket.write(parameter+" doesn't exist");
                }
            break;

            case 'PASS':
                if(socket.userOk===1) {
                    if(login[socket.saveid]["password"] == parameter) {
                        socket.passOk = 1;
                        console.log(socket.username+' is connected');
                        socket.write('Welcome '+socket.username);
                        socket.directory = "Server/"+socket.username;
                        // socket.directory = fs.readdirSync("Server/"+socket.username);
                        // socket.directory = process.cwd();
                        // console.log('Pass directory : '+socket.directory)
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
                    directory = fs.readdirSync(socket.directory);
                    socket.write('Files in the current directory :\n\r');
                    directory.forEach(file => {
                        socket.write(file+'\n');
                    });
                }
                else {
                    socket.write("You have to authenticate first");
                }
            break;

            case 'CWD':
                if(socket.passOk==1){
                    console.log('socket.directory : ',socket.directory)
                    console.log('parameter : ',parameter)
                    if (parameter == '' || parameter == null){
                        socket.write('Error, please use the command HELP to know how to proceed');
                    }
                    if (parameter.slice(0,6) == '../../') {
                        socket.write('You have to go back one folder at the time')
                    }
                    if (socket.directory == ("Server/"+socket.username) && parameter.slice(0,3) == '../') {
                        socket.write('You don\'t have the permissions to reach this folder')
                    }
                    else {
                        let changeFOk=0;
                        if (parameter.slice(0,3) == '../'){
                            textToDel = socket.directory.lastIndexOf('/')
                            socket.directory = socket.directory.slice(0,textToDel) // +parameter.slice(3) // Interdit de monter de niveau et descendre en même temps
                            changeFOk=1;
                        }
                        else if (parameter.slice(0,1) == '/'){
                            fs.access(socket.directory+parameter, function(err) {
                                if (err) {
                                    socket.write('this folder doesn\'t exist')
                                }
                                else {
                                    socket.directory += parameter;
                                    changeFOk=1;
                                }
                            })
                        }
                        else {
                            fs.access(socket.directory+'/'+parameter, function(err) {
                                if (err) {
                                    socket.write('this folder doesn\'t exist')
                                }
                                else {
                                    socket.directory += '/'+parameter;
                                    changeFOk=1;
                                }
                            })
                        }
                        if (changeFOk==1) {
                            socket.write('You have successfully change of directory\n\r');
                            socket.write(socket.directory);
                        }
                    }
                }
                else {
                    socket.write("You have to authenticate first");
                }
            break;
            
            case 'PWD':
                if(socket.passOk==1){
                    nameDir = path.basename(socket.directory)
                    socket.write('The name of the current directory is :');
                    socket.write(nameDir);
                }
                else {
                    socket.write("You have to authenticate first");
                }
            break;

            case 'QUIT':
                if (socket.passOk==1) {
                    console.log(socket.username+' diconnected');
                }
                process.exit();
            break;
        }
    });
});


serveur.listen(PORT, () => {
    console.log("Server started at http://localhost:",PORT);
});
