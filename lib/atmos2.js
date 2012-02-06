(function() {
  var Atmos2, async, express, io, log,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  log = require('./util').log;

  io = require('socket.io');

  express = require('express');

  async = require('async');

  Atmos2 = (function() {

    function Atmos2(port) {
      this.clientConnected = __bind(this.clientConnected, this);
      this.update = __bind(this.update, this);
      this.notification = __bind(this.notification, this);      this.port = port;
    }

    Atmos2.start = function(port) {
      return new Atmos2(port).start();
    };

    Atmos2.prototype.start = function() {
      log("Starging on port " + this.port);
      this.server = express.createServer();
      this.server.use(express.bodyParser());
      this._routing();
      this.server.listen(this.port);
      this.socket = io.listen(this.server);
      return this.socket.sockets.on('connection', this.clientConnected);
    };

    Atmos2.prototype._routing = function() {
      this.server.post('/notification', this.notification);
      return this.server.post('/update', this.update);
    };

    Atmos2.prototype.notification = function(req, res) {
      return this.parse("notification", req, res);
    };

    Atmos2.prototype.update = function(req, res) {
      return this.parse("update", req, res);
    };

    Atmos2.prototype.parse = function(type, req, res) {
      var data, keys, _ref;
      _ref = this._payload(req), data = _ref.data, keys = _ref.keys;
      log("** " + type);
      this.send(type, data, keys);
      res.writeHead(200);
      return res.end("200: " + type + " sent");
    };

    Atmos2.prototype._payload = function(req) {
      return JSON.parse(req.body.payload);
    };

    Atmos2.prototype._endWithError = function(request, message) {
      res.writeHead(500);
      return res.end("500: " + message);
    };

    Atmos2.prototype.send = function(type, data, keys) {
      return async.select(this.socket.sockets.clients(), function(client, callback) {
        return client.get('key', function(err, res) {
          return callback(keys.indexOf(res) !== -1);
        });
      }, function(results) {
        var client, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          client = results[_i];
          _results.push(client.emit(type, data));
        }
        return _results;
      });
    };

    Atmos2.prototype.clientConnected = function(socket) {
      var _this = this;
      log("Socket client connected");
      return socket.on('auth', function(data) {
        return _this.clientAuth(socket, data);
      });
    };

    Atmos2.prototype.clientAuth = function(socket, data) {
      console.log('setting key to ', data);
      return socket.set('key', data);
    };

    return Atmos2;

  })();

  module.exports = Atmos2;

}).call(this);
