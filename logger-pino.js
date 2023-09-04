var fs = require('fs')
var pino = require('pino')
var pretty = require('pino-pretty')
var streams = [
    { stream: fs.createWriteStream('./info.stream.out') },
    { stream: pretty() },
    { level: 'debug', stream: fs.createWriteStream('./debug.stream.out') },
    { level: 'fatal', stream: fs.createWriteStream('./fatal.stream.out') },
]

var log = pino({
    level: 'debug'
}, pino.multistream(streams))


module.exports = log;