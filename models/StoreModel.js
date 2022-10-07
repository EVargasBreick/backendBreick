const dbConnection = require("../server");

function getStores() {
  let storeQuery = `select idAgencia + ' ' + nombre as Nombre from Agencias 
    union select placa from Vehiculos as Nombre 
    union select idBodega + ' ' + nombre as Nombre from Bodegas`;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const stores = await dbConnection.executeQuery(storeQuery);
      resolve(JSON.stringify(stores.data));
      console.log("Almacenes", JSON.stringify(stores.data));
    }, 1000);
  });
}
function getUserStock(params) {
  let stockQuery = `select a.*, c.idUsuario from Stock_Bodega a, Productos b, Usuarios c where a.idBodega=c.idAlmacen and b.idProducto=a.idProducto 
  and c.idUsuario=${params.id} union 
  select a.*, c.idUsuario from Stock_Agencia a, Productos b, Usuarios c where a.idAgencia=c.idAlmacen and b.idProducto=a.idProducto 
  and c.idUsuario=${params.id} union 
  select a.*, c.idUsuario from Stock_Agencia_Movil a, Productos b, Usuarios c where a.idVehiculo=c.idAlmacen and b.idProducto=a.idProducto 
  and c.idUsuario=${params.id}`;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const stores = await dbConnection.executeQuery(stockQuery);
      resolve(JSON.stringify(stores.data));
    }, 1000);
  });
}
module.exports = { getStores, getUserStock };
