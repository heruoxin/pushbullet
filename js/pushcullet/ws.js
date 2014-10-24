var WebSocket = require('ws');
var send_notification = require('./send_notification');
var regist_devices = require('./regist_devices');
if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;

try {
  var token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json').token;
} catch(e) {
  return console.error(e);
}

var start_ws = function() {
  global.HEART_BEAT = 2;
  var connection = new WebSocket('wss://stream.pushbullet.com/websocket/' + token);
  connection.on('open', function(e) {
    console.log('ws open: %s', new Date());
  });
  connection.on('message', function(e) {
    $('.control-window p').html(" ");
    $('.control-window').css({'background-color': '#f6f6f6'});
    $('#menu-bar').css({'background-color': '#f6f6f6'});
    e = JSON.parse(e);
    console.log(e);
    switch (e.type) {
      case 'nop': // HeartBeat
        //console.log('HeartBeat', new Date());
        global.HEART_BEAT += 1;
      break;
      case 'tickle':
        setTimeout(function(){
          $('.control-window').css({'background-color': '#68c14f'});
          $('#menu-bar').css({'background-color': '#68c14f'});
        }, 10);
        setTimeout(function(){
          $('.control-window').css({'background-color': '#f6f6f6'});
          $('#menu-bar').css({'background-color': '#f6f6f6'});
        }, 620);
        if (e.subtype === 'device'){ // device list updated
        global.refresh_info();
        setTimeout(regist_devices, 10000);
      } else { // pushes updated
        global.refresh_history(15);
      }
      break;
      case 'push': // Android notification mirror
        send_notification(e.push);
      break;
    }
  });
  connection.on('error', function(e) {
    console.log('ws error: %s',e);
  });
  connection.on('close', function(e) {
    console.log('close: %s', new Date());
  });
  return connection;
};

global.HEART_BEAT = 2;
var ws = new start_ws();
setInterval(function(){ //HeartBeat check
  if (global.HEART_BEAT-- <= 0){
    global.HEART_BEAT = 2;
    $('.control-window p').html("connect or login error");
    $('.control-window').css({'background-color': '#feeaac'});
    $('#menu-bar').css({'background-color': '#feeaac'});
    console.warn("ws try to restart", new Date());
    ws.close();
    ws = new start_ws();
  }
},30000);


