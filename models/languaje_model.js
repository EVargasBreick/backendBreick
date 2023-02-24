const { client } = require("../postgressConn");
const dbConnection = require("../server");

function getLang() {
  let storeQuery = "select * from Lenguajes";

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const leng = await dbConnection.executeQuery(storeQuery);
      resolve(JSON.stringify(leng.data));
      console.log("LEngiaje", leng.data);
    }, 1000);
  });
}

function getLangPos() {
  let storeQuery = "select * from Lenguajes";
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const leng = await client.query(storeQuery);
        resolve(JSON.stringify(leng.rows));
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

module.exports = { getLang, getLangPos };
