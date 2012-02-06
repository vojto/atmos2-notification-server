(function() {
  var Atmos2, express, io, log,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  log = require("./util").log;

  io = require("socket.io");

  express = require("express");

  Atmos2 = (function() {

    function Atmos2(port) {
      this.didReceiveRequest = __bind(this.didReceiveRequest, this);      this.port = port;
    }

    Atmos2.start = function(port) {
      return new Atmos2(port).start();
    };

    Atmos2.prototype.start = function() {
      log("Starging on port " + this.port);
      this.server = express.createServer();
      this.server.use(express.bodyParser());
      this.server.post('/', this.didReceiveRequest);
      this.server.listen(this.port);
      this.socket = io.listen(this.server);
      return this.socket.sockets.on('connection', this.clientConnected);
    };

    Atmos2.prototype.didReceiveRequest = function(req, res) {
      var data;
      data = JSON.parse(req.body.payload);
      log("Received data: ", data);
      if (data.type == null) {
        return this._endWithError(req, "Received notification without type");
      }
      this.socket.sockets.emit("notification", data);
      res.writeHead(200);
      return res.end("200: Notified");
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
