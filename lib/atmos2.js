(function() {
  var Atmos2, express, io, log,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  log = require("./util").log;

  io = require("socket.io");

  express = require("express");

  Atmos2 = (function() {

    function Atmos2(port) {
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
      var data, users, _ref;
      _ref = this._payload(req), data = _ref.data, users = _ref.users;
      log("New " + type + ": ", data, users);
      this.socket.sockets.emit(type, data);
      res.writeHead(200);
      return res.end("200: " + type + " sent");
    };

    Atmos2.prototype._payload = function(req) {
      return JSON.parse(req.body.payload);
    };

    Atmos2.prototype.clientConnected = function(socket) {
      return log("Socket client connected");
    };

    Atmos2.prototype._endWithError = function(request, message) {
      res.writeHead(500);
      return res.end("500: " + message);
    };

    return Atmos2;

  })();

  module.exports = Atmos2;

}).call(this);
