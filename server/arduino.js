const five = require('johnny-five');

const board = new five.Board();
var led;

board.on('ready', () => {
  led = new five.Led(13);
});

exports.switch = function (status) {
  if(status){
    led.on();
  }else {
    led.off();
  }
}