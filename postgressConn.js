const { Client, Pool } = require("pg");
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

const pool = new Pool({
  host: process.env.POSTGRES_SERVER,
  user: process.env.POSTGRES_USER,
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASS,
  database: database,
  max: 400,
})

try {
  console.log("Client", client);
  client.connect();
} catch (err) {
  console.log("Error", err);
}

module.exports = { client, pool };
