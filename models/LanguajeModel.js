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
module.exports = getLang;
