const { client } = require("../postgressConn");
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

function getZonesPos() {
  let rolQuery = `select "idZona", zona from Zonas`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const zonas = await client.query(rolQuery);
        resolve(JSON.stringify(zonas.rows));
      } catch (err) {
        console.log("error al cargar zonas");
      }
    }, 1000);
  });
}

module.exports = { getZones, getZonesPos };
