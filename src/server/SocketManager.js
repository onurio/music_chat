const io = require('./index.js').io;
var sp = require('schemapack');
// const {midiMessageSchema,stringSchema,intSchema,noteBgSchema} = require('../utils/packTypes');





module.exports = (socket) =>{

    socket.binaryType = 'arraybuffer';


    // socket.on(USER_JOINED,(name)=>{
    // });



    // socket.on(USER_RECONNECT,(name)=>{
    // });

    socket.on('newRoom',(info)=>{
        socket.join(info.id);
        socket.name = info.name;
        console.log(socket.name+' connected!');
        
    });


    socket.on('clFx',(msg)=>{        
        socket.broadcast.emit('clFx',msg);
    });

    socket.on('clSeq',(msg)=>{                
        socket.broadcast.emit('clSeq',msg);
    })

    socket.on('joinRoom',(info)=>{
        socket.to(info.id).emit('friendJoined');
        socket.join(info.id);
        socket.name= info.name;
        console.log(socket.name+' joined a room!');
        
    })


    
    
    socket.on('disconnect',()=>{
    });
};
