const fs = require('fs');
const EventEmiter = require('events');
const myEmitter = new EventEmiter();
const net = require('net');
const process = require('process');
const path = require('path');

const PORT = process.argv[2] || 4242;

const serveur = net.createServer((socket) => {
    console.log('new Connection');
    
    socket.on('data',(data) =>{
        const [directive,parameter] = data.toString().split(' ');
        const ufile = fs.readFileSync('./users.json');
        let login = JSON.parse(ufile);
        let userOk = Boolean;
        userOk = 0;
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
                    socket.write('User '+parameter+' exist\r');
                    socket.write('Now you have to enter your password with the command PASS\n');
                    socket.username = parameter;
                    socket.saveid = save;
                    socket.userOk = userOk;
                }
                else {
                    socket.write(parameter+" doesn't exist\n");
                }
            break;

            case 'PASS':
                if(socket.userOk===1) {
                    if(login[socket.saveid]["password"] == parameter) {
                        socket.passOk = 1;
                        console.log(socket.username+' is connected');
                        socket.write('Welcome '+socket.username+'\n');
                        socket.directory = "Server/"+socket.username;
                        socket.directoryUser = "Client/"+socket.username;
                    }
                    else {
                        socket.write('wrong password\n');
                    }
                }
                else {
                    socket.write("Erreur : Veuillez entrez votre nom d'utilisateur avant")
                    socket.write("utilisez la commande -> USER <username>\n")
                } 
            break;

            case 'LIST':
                if(socket.passOk==1){
                    directory = fs.readdirSync(socket.directory);
                    socket.write('Files in the current directory :');
                    directory.forEach(file => {
                        socket.write(file+'\n');
                    });
                }
                else {
                    socket.write("You have to authenticate first\n");
                }
            break;

            case 'CWD':
                if(socket.passOk==1){
                    if (parameter == '' || parameter == null){
                        socket.write('Error, please use the command HELP to know how to proceed\n');
                    }
                    if (parameter.slice(0,6) == '../../') {
                        socket.write('You have to go back one folder at the time\n');
                    }
                    if (socket.directory == ("Server/"+socket.username) && parameter.slice(0,3) == '../') {
                        socket.write('You don\'t have the permissions to reach this folder\n');
                    }
                    else {
                        if (parameter.slice(0,3) == '../'){
                            textToDel = socket.directory.lastIndexOf('/')
                            socket.directory = socket.directory.slice(0,textToDel) // +parameter.slice(3) // Interdit de monter de niveau et descendre en même temps
                            socket.write('You have successfully change of directory\n\r');
                        }
                        else if (parameter.slice(0,1) == '/'){
                            fs.access(socket.directory+parameter, function(err) {
                                if (err) {
                                    socket.write('this folder doesn\'t exist\n')
                                }
                                else {
                                    socket.directory += parameter;
                                    socket.write('You have successfully change of directory\n\r');
                                }
                            })
                        }
                        else {
                            fs.access(socket.directory+'/'+parameter, function(err) {
                                if (err) {
                                    socket.write('this folder doesn\'t exist\n')
                                }
                                else {
                                    socket.directory += '/'+parameter;
                                    socket.write('You have successfully change of directory\n\r');
                                }
                            })
                        }
                    }
                }
                else {
                    socket.write("You have to authenticate first\n");
                }
            break;
            
            case 'RETR':
                if(socket.passOk==1){
                    const readSteam = fs.createReadStream(socket.directory+'/'+parameter);
                    const writeSteam = fs.createWriteStream(socket.directoryUser+'/'+parameter);
                    readSteam.pipe(writeSteam);
                    socket.write("The file "+parameter+" has been transfered to the client side !\n")
                }
                else {
                    socket.write("You have to authenticate first\n");
                }
            break;

            case 'STOR':
                if(socket.passOk==1){
                    const readSteam = fs.createReadStream(socket.directoryUser+'/'+parameter);
                    const writeSteam = fs.createWriteStream(socket.directory+'/'+parameter);
                    readSteam.pipe(writeSteam);
                    socket.write("The file "+parameter+" has been transfered to the server !\n")
                }
                else {
                    socket.write("You have to authenticate first\n");
                }
            break;
            
            case 'PWD':
                if(socket.passOk==1){
                    nameDir = path.basename(socket.directory)
                    socket.write('The name of the current directory is : \n');
                    socket.write(nameDir+'\n');
                }
                else {
                    socket.write("You have to authenticate first\n");
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
