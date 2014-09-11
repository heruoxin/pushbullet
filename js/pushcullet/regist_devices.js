var https = require('https');
var bl = require('bl');
var save_history = require('./save_history');

var token = process.argv.slice(2)[0];
if (!token) {
  token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json').token;
}

var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json';

//regist a new device

module.exports = function (data, iden, cb) {
  if (!data) { return console.error("No data given!");}

  if (typeof(iden) === "function"){
    cb = iden;
  } else if ( iden !== "all"){
    if (iden.indexOf('@') >= 0){
      data.email = iden;
    } else {
      data.device_iden = iden;
    }
  }

  var post_data = JSON.stringify(data);

  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/pushes',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': post_data.length
    }
  };


  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(e, d){
      d = JSON.parse(d);
      if (e) {return console.error(e);}
      save_history({'new pushes': d});
      if (cb){cb(d);}
    }));
  });
  req.write(post_data);
  req.end();


};

//______

//module.exports({
//  'type': 'note',
//  'title': '233',
//  'body': '2323233'
//},'udfZpddgpV', console.log);
