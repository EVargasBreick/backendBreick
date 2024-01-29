var pino = require("pino");
const { client } = require("./postgressConn");
var pretty = require("pino-pretty");

const build = require("pino-abstract-transport");

const streamPostgres = build(function (source) {
  source.on("data", function (obj) {
    if (obj.level >= 50) { // Only insert logs with level 50 (error) or above
      client.query(
        `INSERT INTO logs (level, time, pid, hostname, name, msg)
          VALUES ($1, to_timestamp($2 / 1000.0), $3, $4, $5, $6);`,
        [obj.level, obj.time, obj.pid, obj.hostname, obj.name, obj.msg],
        (err, res) => {
          if (err) {
            console.log("Error inserting log", err);
          }
        }
      );
    }
  });
});

var streams = [{ stream: streamPostgres }, { stream: pretty() }];

const logger = pino(
  {
    name: process.env.TYPE,
    safe: true,
    level: "trace", // Set the log level to trace to capture all log levels
  },
  pino.multistream(streams)
);

module.exports = logger;
