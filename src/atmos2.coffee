{log}     = require('./util')
io        = require('socket.io')
express   = require('express')
async     = require('async')

class Atmos2
  # Lifecycle
  # ---------------------------------------------------------------------------
  
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

  # Parsing HTTP Requests
  # ---------------------------------------------------------------------------  

  notification: (req, res) =>
    @parse("notification", req, res)
  
  update: (req, res) =>
    @parse("update", req, res)

  # TODO for both:
  # Send only to those keys included in the key list.
  parse: (type, req, res) ->
    {data, keys} = @_payload(req)
    log "** #{type}"
    @send type, data, keys
    res.writeHead(200)
    res.end("200: #{type} sent")
  
  _payload: (req) ->
    JSON.parse(req.body.payload)

  _endWithError: (request, message) ->
    res.writeHead(500)
    res.end("500: #{message}")
  
  # Sending socket messages
  # ---------------------------------------------------------------------------
  
  send: (type, data, keys) ->
    async.select @socket.sockets.clients(), (client, callback) ->
      client.get 'key', (err, res) ->
        callback(keys.indexOf(res) != -1)
    , (results) ->
      for client in results
        client.emit(type, data)
      
  # Receiving socket messages
  # ---------------------------------------------------------------------------  

  clientConnected: (socket) =>
    log "Socket client connected"
    socket.on 'auth', (data) =>
      @clientAuth socket, data
  
  clientAuth: (socket, data) ->
    console.log 'setting key to ', data
    socket.set 'key', data


module.exports = Atmos2