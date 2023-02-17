const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "1123581321",
  database: "DB_CRMBREICKALT",
});

client.connect();
module.exports = { client };
