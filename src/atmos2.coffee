{log} = require "./util"
io = require "socket.io"
express = require "express"

class Atmos2
  constructor: (port) ->
    @port = port
  
  @start: (port) ->
    new Atmos2(port).start()
  
  start: () ->
    log "Starging on port #{@port}"
    @server = express.createServer()
    @server.use express.bodyParser()
    @_routing()
    @server.listen(@port)
    
    @socket = io.listen(@server)
    @socket.sockets.on 'connection', this.clientConnected
  
  _routing: ->
    @server.post '/notification', this.notification
    @server.post '/update', this.update

  notification: (req, res) =>
    @parse("notification", req, res)
  
  update: (req, res) =>
    @parse("update", req, res)

  # TODO for both:
  # Send only to those users included in the users list.
  parse: (type, req, res) ->
    {data, users} = @_payload(req)
    log "New #{type}: ", data, users
    @socket.sockets.emit type, data
    res.writeHead(200)
    res.end("200: #{type} sent")
  
  _payload: (req) ->
    JSON.parse(req.body.payload)
  
  clientConnected: (socket) ->
    log "Socket client connected"
  
  _endWithError: (request, message) ->
    res.writeHead(500)
    res.end("500: #{message}")

module.exports = Atmos2