var request = require('request'),
    util = require('util'),
    helpers = require('./lib/helpers'),
    core = require('./lib/core'),
    push = require('./lib/push');

function DataSift(options){
  if(!options) { throw new Error('You must include your USERNAME and API_KEY in options'); }
  this.username = options.USERNAME;
  this.api_key = options.API_KEY;
  this.vars = {
    username: this.username,
    api_key: this.api_key
  };

  this.core.vars = this.vars;
  this.core.sendRequest = this.sendRequest;

  this.helpers.core = this.core;

  this.push.vars = this.vars;
  this.push.sendRequest = this.sendRequest;
};


DataSift.prototype.core = core;

DataSift.prototype.helpers = helpers;

DataSift.prototype.push = push;

DataSift.prototype.sendRequest = function sendRequest(call, params, callback){
  var headers = {
    Auth: this.vars.username + ":" + this.vars.api_key
  };
  var req = request.defaults({
    secureOptions: require('constants').SSL_OP_NO_TLSv1
  });
  req.post({
    headers: headers,
    url: "https://api.datasift.com/" + call,
    form: params
  }, function(err, res, data){
    if (err) {
      callback(new DataSiftError(err));
    } else {
      if (!data) { data = "{}" };
      data = JSON.parse(data);
      if (data.error) {
        callback(new DataSiftError(data.error));
      } else {
        callback(null, data, res);
      }
    }
  });
};

function DataSiftError (message) {
  Error.captureStackTrace(this, DataSiftError);
  this.message = message;
}

util.inherits(DataSiftError, Error);

module.exports = DataSift;