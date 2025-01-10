const express=require('express');
const app=express();
const http=require('http');
const socketIO=require('socket.io');
const server=http.createServer(app);
const io=socketIO(server);
const path=require('path');

app.set('view engine','ejs'); 
app.use(express.static(path.join(__dirname,"public")));

io.on('connection',(socket)=>{
    socket.on('signalingMessage',(msg)=>{
        socket.broadcast.emit('signalingMessage',msg)
    })
})

app.get('/',(req,res)=>{
    res.render('index');
})



server.listen(3000);