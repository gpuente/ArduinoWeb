const cam = require('../build/Release/camera.node');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const arduino = require('./arduino.js');

const clients = {};
const led = { status: false }

app.use(express.static('public'));

app.get('/hello', (req, res) => {
  res.status(200).send({ message: 'server is running' });
});

io.on('connection', (socket) => {
  connectClient(socket);
  socket.emit('updateStatus', led);

  socket.on('changeStatus', (payload) => {
    console.log('a new user has requested change status led');
    led.status = !led.status;
    console.log('led status: ' + led.status);
    io.sockets.emit('updateStatus', led);
    arduino.switch(led.status);
  });

  socket.on('disconnect', () => {
    disconnectClient(socket);
  });
});

const connectClient = (ws) =>{
  const id = ws.id;
  clients[id] = ws;
  console.log(`New client connected. ID: ${id}`);
  if(!cam.IsOpen()){
    console.log('Clients connected, opening camera...');
    cam.Open(frameCallback, {
      width: 640,
      height: 360,
      window: false,
      codec: '.jpg',
      input: '',
    });
  }
  return id;
};

const disconnectClient = (ws) => {
  delete clients[ws.id];
  console.log(`Client ${ws.id} disconnected`);
  if(Object.keys(clients).length < 1){
    console.log('No clients connected, closing camera..')
    cam.Close();
    led.status = false;
    arduino.switch(led.status);
  }
};

const frameCallback = (img) => {
  const frame = {
    type: 'frame',
    frame: new Buffer(img, 'ascii').toString('base64'),
  }
  const payload = JSON.stringify(frame);
  for(var index in clients){
    clients[index].emit(frame.type, frame);
  }
};

server.listen(3000, () => {
  console.log('Server started on: http://localhost:3000');
});