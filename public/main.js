window.onbeforeunload = closeCode;

var socket = io.connect('http://192.168.8.100:3000', { forceNew: true });
var stream = document.getElementById("stream");
var context = stream.getContext("2d");
var image = null;

adjustSize(640, 360);

socket.on('updateStatus', function(payload) {
  console.log(payload);
  //var texto = payload.status ? 'Off' : 'On';
  var status = payload.status ? 'On' : 'Off';
  //document.getElementById('control').innerHTML = texto;
  setButton('control', payload.status);
  document.getElementById('status').innerHTML = '<span>Current status: <strong>'+ status +'</strong> </span>'
});

socket.on('frame', function(payload){
  console.log(payload);
  if(payload.frame){
    image = 'data:image/jpg;base64,' + payload.frame;
    drawFrame(image);
  }
});

function changeStatus(){
  console.log('clicked');
  socket.emit('changeStatus', {});
};

function drawFrame(frame){
  var img = new Image();
  img.onload = function () {
    context.drawImage(img, 0, 0);
  }
  img.src = frame;
}

function adjustSize(width, height) {
  stream.width = width;
  stream.height = height;
  stream.style.width = '100%';
  stream.style.height = 'auto';
};

function closeCode(){
  socket.disconnect(true);
}

function setButton(id, status){
  var texto = status ? 'Off' : 'On';
  var classStyle = status ? 'btn btn-danger' : 'btn btn-success';
  document.getElementById(id).innerHTML = texto;
  document.getElementById(id).className = classStyle;
}