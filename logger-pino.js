var pino = require('pino')
const { client } = require('./postgressConn')
var pretty = require('pino-pretty')

const build = require('pino-abstract-transport')

const streamPostgres = build(function (source) {
    source.on('data', function (obj) {
        client.query(`INSERT INTO logs (level, time, pid, hostname, name, msg)
        VALUES (${obj.level}, to_timestamp(${obj.time} / 1000.0), ${obj.pid}, '${obj.hostname}', '${obj.name}', '${obj.msg}');`, (err, res) => {
            if (err) {
                console.log('Error insertando log', err)
            }
        }
        )
    })
})

var streams = [
    { stream: streamPostgres },
    { stream: pretty() },
]

const logger = pino({
    name: process.env.TYPE,
    safe: true,
    level: 'debug',
}, pino.multistream(streams))

module.exports = logger