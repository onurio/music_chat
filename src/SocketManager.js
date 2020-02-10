const io = require('./index.js').io;
var sp = require('schemapack');
const {USER_JOINED,ADMIN_JOINED,MIDIIN,MAXADMIN_JOINED,USER_STATE_CHANGED,SEND_USER_LIST,MIDIOUT,VISUAL_JOINED,USER_RECONNECT,CTLIN} = require('../Events.js');
const {midiMessageSchema,stringSchema,intSchema,noteBgSchema} = require('../utils/packTypes');
const connectedUsers = {};
const idName={};
const {rainbow} = require('../utils/utils');

let pianoCounter = 0;
let pingPongCounter = 0;
let idList = [];
let notes = {};


let activePlayers = {};
let passivePlayers = {};
let activeIdList = [];

let pingPongInterval;



let appName;

let phonePianoMode ='free';


module.exports = (socket) =>{

    socket.binaryType = 'arraybuffer';


    socket.on(ADMIN_JOINED,()=>{
        console.log('admin joined');
        socket.join('admin');
        socket.emit(SEND_USER_LIST,idName);
    });


    socket.on(USER_STATE_CHANGED,(state)=>{
        console.log(state);
    });

    socket.on(MAXADMIN_JOINED,()=>{
        socket.name = 'maxAdmin';
        socket.join('maxadmin');
        console.log(`max admin ${socket.id} joined`);
        
    });

    socket.on('phonepiano_mode',(msg)=>{
            phonePianoMode = msg;
            io.sockets.emit('phonepiano_mode',phonePianoMode);
    });

    socket.on(VISUAL_JOINED,()=>{
        socket.name = 'maxVisuals';
        console.log(`visual ${socket.id} joined`);
        socket.join('visual');
    });

    socket.on(USER_JOINED,(name)=>{
        socket.name = name;
        console.log(`user ${name} has connected`);
        connectedUsers[socket.id] = socket;
        idList = [...Object.keys(connectedUsers)];
        idName[name] = socket.id;
        socket.join('general');
        // io.to('admin').emit('users',idList);
        io.to('admin').emit(SEND_USER_LIST,idName);
    });



    socket.on(USER_RECONNECT,(name)=>{
        socket.name = name;
        console.log(`user ${name} has reconnected`);
        connectedUsers[socket.id] = socket;
        idList = [...Object.keys(connectedUsers)];
        idName[name] = socket.id;
        socket.join('general');
        // io.to('admin').emit('users',idList);
        io.to('admin').emit(SEND_USER_LIST,idName);
    });

    
    socket.on(MIDIIN,(msg)=>{
        switch(appName){
            case 'phonePiano':
                playNotes(midiMessageSchema.decode(msg)); 
                break;
            case 'sampleTriggerer':
                if(midiMessageSchema.decode(msg)[1]>0){
                    io.sockets.binary(true).emit('noteon',noteBgSchema.encode({note: msg,bg:rainbow(Math.round(Math.random()*20),Math.random()*20) }));
                    // io.sockets.binary(true).emit('bg',stringSchema.encode(rainbow(Math.round(Math.random()*8),Math.random()*8)));
                }
                break;
            default:
                return;
        }
        
    });

    socket.on(CTLIN,(msg)=>{
        io.to('general').binary(true).emit(CTLIN,msg);
    });


    socket.on('pi',()=>{
        clearInterval(pingPongInterval);
        io.to('maxadmin').emit(MIDIOUT,intSchema.encode(1));
        io.to('visual').emit(MIDIOUT);
        pingPong();
        io.to('spectators').binary(false).emit('bg',stringSchema.encode(rainbow(Math.round(Math.random()*8),Math.random()*8)));
    });

    socket.on('pim',()=>{
        clearInterval(pingPongInterval);        
        io.to('maxadmin').emit(MIDIOUT,intSchema.encode(2));
        pingPong();
    });


    socket.on('pipo_start',()=>{
        // pingPongSafety();
        activePlayers = {...connectedUsers};  
        activeIdList = Object.keys(activePlayers);    
        pingPong();
        
    });


    

    socket.on('pipo_stop',()=>{
        console.log('stopppped');
    });

    socket.on('pingPong_dis',(id)=>{
        id = stringSchema.decode(id);
        activePlayers[id].join('spectators');
        delete activePlayers[id];
        activeIdList = Object.keys(activePlayers);
        io.to('spectators').binary(true).emit('pp_players',intSchema.encode(activeIdList.length));
        if(activeIdList.length > 1){
            pingPongCounter =  pingPongCounter % activeIdList.length;
        }else{
            clearInterval(pingPongInterval);
            console.log(activePlayers[activeIdList[0]].name +' is the winner!');
            activePlayers[activeIdList[0]].emit('pp_win');
            io.to('spectators').binary(true).emit('pp_win_name',stringSchema.encode(activePlayers[activeIdList[0]].name));
            idList.forEach((id)=>{
                connectedUsers[id].leave('spectators');
            });
            setTimeout(()=>{
                activePlayers = {...connectedUsers};  
                activeIdList = Object.keys(activePlayers); 
                appName = 'pingPong'
                io.to('general').binary(true).emit('pp_reset');   
            },4000);
        }
    });
    
    





    socket.on('appName',(name)=>{
        appName = name
        io.sockets.binary(true).emit('app',stringSchema.encode(name));
    });

    socket.on('getApp',()=>{
        if(appName!=undefined){
            io.sockets.binary(true).emit('app',stringSchema.encode(appName));
        }
    });



    socket.on('get_phonepiano_mode',()=>{
        socket.emit('phonepiano_mode',phonePianoMode);
    });

    
    
    socket.on('disconnect',()=>{
        

        switch(socket.name){
            case 'maxAdmin':
                console.log('maxAdmin disconnected');
                break;
            case 'maxVisuals':
                console.log('maxVisuals disconnected');
                break;
            default:
                if(socket.name){
                    delete idName[socket.name];
                    delete activePlayers[socket.id];
                    activeIdList = [...Object.keys(activePlayers)];
                    delete connectedUsers[socket.id];
                    idList = [...Object.keys(connectedUsers)];
                    io.to('admin').emit(SEND_USER_LIST,idName);
                    console.log(`user ${socket.name} disconnected`);
                }else{
                    console.log(socket.id);         
                }
                break;
        }
        
    });
};

const playNotes = (note) =>{
    if(idList.length>0){ 
        if(note[1]>0){
            if(connectedUsers[idList[pianoCounter]]){
                connectedUsers[idList[pianoCounter]].binary(true).emit('noteon',midiMessageSchema.encode(note));
            }
            notes[note[0]] = idList[pianoCounter];
            pianoCounter++;
            pianoCounter = pianoCounter % idList.length;
        }else{
            if(connectedUsers[notes[note[0]]]){
                connectedUsers[notes[note[0]]].binary(true).emit('noteoff',midiMessageSchema.encode(note));
            }
            notes[note[0]] = null;

        }
    }else{
        console.log('no users connected');
    }
}



const pingPong=()=>{
    if(activeIdList.length>1){
        activePlayers[activeIdList[pingPongCounter]].emit('po');
        pingPongCounter++;
        pingPongCounter = pingPongCounter % activeIdList.length;
        pingPongSafety();
    }
}

const pingPongSafety = ()=>{
    pingPongInterval = setTimeout(()=>{
        console.log('safetycalled');
        
        pingPong();
    },5000);
}

