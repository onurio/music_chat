const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = module.exports.io = require('socket.io')(server);

const PORT = process.env.PORT || 4000;
const SocketManager = require('./SocketManager.js');

io.on('connection',SocketManager);

app.use( express.static(__dirname+'/../../build'));

server.listen(PORT,()=>{
    console.log(`server listening on ${PORT}`);
});