var https = require('https');
var save_history = require('./save_history');

var token = process.argv.slice(2)[0];
if (!token) {
  token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json').token;

}

var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json';

//pushbullet getting & saving push history

module.exports = function (time) {

//time = 604800 为最近一周

var options = {
  hostname: 'api.pushbullet.com',
  port: 443,
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + new Buffer(token+':').toString('base64')
  }
};

if (time) {
  options.path = '/v2/pushes?modified_after=' + (Date.parse(new Date())/1000 - time);
} else {
  options.path = '/v2/pushes';
}

var req = https.request(options, function(res) {
  var push_history ='';
  res.setEncoding('utf8');
  res.on('data', function(d) {
    push_history += d;
  });
  res.on('end', function(e){
    if (e) {return console.error(e);}
    //console.log(JSON.parse(push_history));
    if (time){
    return save_history(JSON.parse(push_history).pushes);
    }
    return save_history(JSON.parse(push_history).pushes, "refresh all");
  });
});
req.end();


};
