const { Client } = require("pg");
const database =
  process.env.TYPE == "local"
    ? process.env.POSTGRES_DATABASE_TEST
    : process.env.POSTGRES_DATABASE;
const client = new Client({
  host: process.env.POSTGRES_SERVER,
  user: process.env.POSTGRES_USER,
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASS,
  database: database,
});
console.log("Client", client);
try {
  client.connect();
} catch (err) {
  console.log("Erroooor", err);
}

module.exports = { client };
