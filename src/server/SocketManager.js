const io = require('./index.js').io;
var sp = require('schemapack');
const {midiMessageSchema,stringSchema,intSchema,noteBgSchema} = require('../utils/packTypes');





module.exports = (socket) =>{

    socket.binaryType = 'arraybuffer';


    socket.on(USER_JOINED,(name)=>{
    });



    socket.on(USER_RECONNECT,(name)=>{
    });


    
    
    socket.on('disconnect',()=>{
    });
};
