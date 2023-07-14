const { Client } = require("pg");
const client = new Client({
  host: process.env.POSTGRES_SERVER,
  user: process.env.POSTGRES_USER,
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DATABASE,
});
try {
  client.connect();
} catch (err) {
  console.log("Erroooor", err);
}

module.exports = { client };
