const { client } = require("../postgressConn");
const dbConnection = require("../server");

function getDays() {
  let rolQuery = "select * from Dias_Frecuencia";

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const dias = await dbConnection.executeQuery(rolQuery);
      resolve(JSON.stringify(dias.data));
    }, 1000);
  });
}

function getDaysPos() {
  let rolQuery = "select * from Dias_Frecuencia";

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const dias = await client.query(rolQuery);
        resolve(JSON.stringify(dias.rows));
      } catch (err) {
        reject(JSON.stringify(err));
      }
    }, 1000);
  });
}

module.exports = { getDays, getDaysPos };
