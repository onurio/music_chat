const express = require('express');
const app = express();
const path = require('path');

const server = require('http').Server(app);
const io = module.exports.io = require('socket.io')(server);

const PORT = process.env.PORT || 4000;
const SocketManager = require('./SocketManager.js');

io.on('connection',SocketManager);

app.use( express.static(__dirname+'/../../build'));

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/../../build/index.html'));
    
});

server.listen(PORT,()=>{
    console.log(`server listening on ${PORT}`);
});