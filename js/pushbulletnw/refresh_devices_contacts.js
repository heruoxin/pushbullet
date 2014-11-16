var fs = require('fs');
var https = require('https');
var getInfo = require('./getInfo');

module.exports = function(token, options, cb){

  options = options || {};
  if(options.hasOwnProperty("win")) {
    global.mainWin.moveTo(options.win.x, options.win.y);
  }
  var old_info;
  if (!token) {
    old_info = getInfo.getInfo();
    token = old_info.token;
    options = old_info.options;
    for (var i in old_info.options) {
      if (options.hasOwnProperty(i)) continue;
      options[i] = old_info.options[i];
    }
  }

  var info = {
    token: token,
    options: options
  };

  //pushbullet getting devices list
  var devices_options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/devices',
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64')
    }
  };
  var req = https.request(devices_options, function(res) {
    var d = '';
    res.setEncoding('utf8');
    res.on('error', function(e){
      console.error(e);
    });
    res.on('data', function(chunk) {
      d += chunk;
    });
    res.on('end', function(e) {
      if (e) {return console.error(e);}
      if (JSON.parse(d).hasOwnProperty('error')){
        if (cb){
          return cb(false, "Login Error. Check your token or network");
        }
      }
      info.devices = JSON.parse(d).devices;
      save();
    });
  });
  req.end();

  //pushbullet getting contacts list
  var contacts_options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/contacts',
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64')
    }
  };
  var req_2 = https.request(contacts_options, function(res) {
    var d = '';
    res.setEncoding('utf8');
    res.on('error', function(e){
      console.error(e);
    });
    res.on('data', function(chunk) {
      d += chunk;
    });
    res.on('end', function(e) {
      if (e) {return console.error(e);}
      info.contacts = JSON.parse(d).contacts;
      save();
    });
  });
  req_2.end();

  var save = function(){
    info.options.win = {
      x: global.mainWin.x,
      y: global.mainWin.y,
    };
    if (info.hasOwnProperty("devices") && info.hasOwnProperty("contacts")) getInfo.saveInfo(info, cb);
  };
};
