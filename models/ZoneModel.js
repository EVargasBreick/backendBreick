const dbConnection = require("../server");

function getZones() {
  let rolQuery = "select idZona, zona from Zonas";

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const zonas = await dbConnection.executeQuery(rolQuery);
      resolve(JSON.stringify(zonas.data));
    }, 1000);
  });
}
module.exports = getZones;
