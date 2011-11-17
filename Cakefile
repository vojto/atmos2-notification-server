{print}       = require 'sys'
{spawn} = require 'child_process'
fs = require 'fs'
coffeescript = require 'coffee-script'

build = (callback) ->
  options = ['-c', '-o', 'node_modules', 'src']
  coffee = spawn 'coffee', options
  coffee.stdout.on 'data', (data) -> print data.toString()
  coffee.stderr.on 'data', (data) -> print data.toString()
  coffee.on 'exit', (status) -> callback?() if status is 0

task 'run', (options)->
  build ->
    Notifiction = require "notifiction"
    notifiction = new Notifiction(5000)
    notifiction.start()