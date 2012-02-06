{log} = require "./util"
io = require "socket.io"
express = require "express"

class Atmos2
  constructor: (port) ->
    @port = port
  
  start: () ->
    @server = express.createServer()
    @server.use express.bodyParser()
    @server.post '/', this.didReceiveRequest
    @server.listen(@port)
    
    @socket = io.listen(@server)
    @socket.sockets.on 'connection', this.clientConnected
  
  didReceiveRequest: (req, res) =>
    data = JSON.parse(req.body.payload)
    log "Received data: ", data
    return this._endWithError(req, "Received notification without type") unless data.type?
    @socket.sockets.emit "notification", data
    res.writeHead(200)
    res.end("200: Notified")
  
  clientConnected: (socket) ->
    log "Socket client connected"
  
  _endWithError: (request, message) ->
    res.writeHead(500)
    res.end("500: #{message}")

module.exports = Atmos2