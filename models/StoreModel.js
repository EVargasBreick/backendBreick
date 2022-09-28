const dbConnection = require("../server");

function getStores() {
  let storeQuery =
    "select idAgencia + ' ' + nombre as Nombre from Agencias union select placa from Vehiculos as Nombre";

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const stores = await dbConnection.executeQuery(storeQuery);
      resolve(JSON.stringify(stores.data));
      console.log("Almacenes", JSON.stringify(stores.data));
    }, 1000);
  });
}
module.exports = getStores;
