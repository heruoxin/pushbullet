var gui = global.gui;
var console = global.console;
var getInfo = require('./getInfo');
var https = require('https');
var bl = require('bl');

exports.newWindow = function(e){
  global.CONVERSATION_DATA = e;
  return gui.Window.open('html/conversation.html', {
    position: "mouse",
    min_width: 210,
    min_height: 250,
    max_width: 450,
    max_height: 500,
    width: 255,
    height: 300,
    transparent: true,
    toolbar: false,
    frame: false
  });
};

exports.pageBind = function(document, location, win){

  //show message and title
  var conversationData = {};
  for (var i in global.CONVERSATION_DATA) {
    conversationData[i] = global.CONVERSATION_DATA[i];
  }
  document.getElementById('conversation-title').innerHTML = conversationData.title;
  document.getElementById('conversation-body').innerHTML = global.message_history[conversationData.conversation_iden] + '<div id="bottom"></div>';
  location.href = '#bottom';

  var preSendReply = function(){
    document.getElementById('send-button').innerHTML = '<img src="../img/loading.gif" />';
    document.getElementById("send-input").setAttributeNode(document.createAttribute("disabled"));
    var message = document.getElementById('send-input').value;
    var postData = {
      "type": "push",
      "push": {
        "type": "messaging_extension_reply",
        "package_name": conversationData.package_name,
        "source_user_iden": conversationData.source_user_iden,
        "target_device_iden": conversationData.source_device_iden,
        "conversation_iden": conversationData.conversation_iden,
        "message": message
      }
    };
    sendSMS(postData, function(d){
      document.getElementById('send-button').innerHTML = 'Send';
      document.getElementById("send-input").removeAttribute("disabled");
      document.getElementById('conversation-body').innerHTML = '<div id="bottom"><a>aaaaaaa</a></div>';
      location.href = '#bottom';
      win.close();
    });
  };
  document.getElementById('send-button').onclick = preSendReply;

  //button behave
  document.getElementsByClassName('close')[0].onclick = function(){
    win.close();
  };
  document.getElementsByClassName('minimize')[0].onclick = function(){
    win.minimize();
  };
  //window active or not
  win.on('focus', function() {
    var trafficeLights = document.getElementById('traffice-light').getElementsByTagName('a');
    trafficeLights[0].className = trafficeLights[0].className.replace("deactivate", "");
    trafficeLights[1].className = trafficeLights[1].className.replace("deactivate", "");
  });
  win.on('blur', function() {
    //$('.traffice-light a').addClass('deactivate');
    var trafficeLights = document.getElementById('traffice-light').getElementsByTagName('a');
    trafficeLights[0].className += " deactivate";
    trafficeLights[1].className += " deactivate";
  });
};

exports.sendSMS = sendSMS;
function sendSMS (postData, cb) {
  var token = getInfo.getInfo().token;
  post = JSON.stringify(postData);

  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/ephemerals',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(post)
    }
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(e, d){
      if (e) {
        if (cb) cb(d);
        return console.error("Error:", e);
      }
      d = JSON.parse(d);
      if (cb) cb(d);
      if (!global.message_history[postData.push.conversation_iden]) {
        global.message_history[postData.push.conversation_iden] = '<p class="send-message">'+postData.push.message+'</p>';
      } else {
        global.message_history[postData.push.conversation_iden] += '<p class="send-message">'+postData.push.message+'</p>';
      }
      return console.log("Message Reply:", d);
    }));
  });
  req.write(post);
  req.end();
}
