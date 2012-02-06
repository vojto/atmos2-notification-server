{print}       = require 'sys'
{spawn} = require 'child_process'
fs = require 'fs'
coffeescript = require 'coffee-script'

build = (callback) ->
  options = ['-c', '-o', 'lib', 'src']
  coffee = spawn 'coffee', options
  coffee.stdout.on 'data', (data) -> print data.toString()
  coffee.stderr.on 'data', (data) -> print data.toString()
  coffee.on 'exit', (status) -> callback?() if status is 0

task 'run', (options)->
  build ->
    require("atmos2").start(5000)

task 'build', ->
  build()