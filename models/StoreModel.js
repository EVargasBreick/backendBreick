const dbConnection = require("../server");
const dateString = require("../services/dateServices");

function getStores() {
  let storeQuery = `select idAgencia + ' ' + nombre as Nombre, idAgencia from Agencias 
    union select placa as Nombre, placa  from Vehiculos 
    union select idBodega + ' ' + nombre as Nombre, idBodega from Bodegas`;

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

function updateProductStock(body) {
  const dateResult = dateString();
  const operator = body.accion === "add" ? "+" : "-";
  console.log("Body de la actualizacion", body);
  console.log("Fecha string", dateResult);
  return new Promise((resolve, reject) => {
    if (body.productos.length > 0) {
      if (body.accion == "add") {
        body.productos.map((prod) => {
          setTimeout(async () => {
            let updateStockQuery = `update Stock_Bodega set cant_Anterior=(select cant_Actual from Stock_Bodega where idProducto=${prod.idProducto} and idBodega='${body.idAlmacen}'), 
          diferencia=${prod.cantProducto}, cant_Actual=(select cant_Actual from Stock_Bodega where idProducto=${prod.idProducto} and idBodega='${body.idAlmacen}') ${operator} ${prod.cantProducto},
          fechaActualizacion='${dateResult}' where idProducto=${prod.idProducto} and idBodega='${body.idAlmacen}'
          update Stock_Agencia set cant_Anterior=(select cant_Actual from Stock_Agencia where idProducto=${prod.idProducto} and idAgencia='${body.idAlmacen}'), 
          diferencia=${prod.cantProducto}, cant_Actual=(select cant_Actual from Stock_Agencia where idProducto=${prod.idProducto} and idAgencia='${body.idAlmacen}') ${operator} ${prod.cantProducto},
          fechaActualizacion='${dateResult}' where idProducto=${prod.idProducto} and idAgencia='${body.idAlmacen}'
          update Stock_Agencia_Movil set cant_Anterior=(select cant_Actual from Stock_Agencia_Movil where idProducto=${prod.idProducto} and idVehiculo='${body.idAlmacen}'), 
          diferencia=${prod.cantProducto}, cant_Actual=(select cant_Actual from Stock_Agencia_Movil where idProducto=${prod.idProducto} and idVehiculo='${body.idAlmacen}') ${operator} ${prod.cantProducto},
          fechaActualizacion='${dateResult}' where idProducto=${prod.idProducto} and idVehiculo='${body.idAlmacen}'`;
            const updated = await dbConnection.executeQuery(updateStockQuery);
            resolve({
              data: updated,
              code: 200,
            });
          }, 700);
        });
      } else {
        const verification = verifyStock(body);
        verification
          .then((response) => {
            console.log("Stock verificado correctamente", response);
            body.productos.map((prod) => {
              console.log("Actualizando stock...");
              setTimeout(async () => {
                let updateStockQuery = `update Stock_Bodega set cant_Anterior=(select cant_Actual from Stock_Bodega where idProducto=${prod.idProducto} and idBodega='${body.idAlmacen}'), 
            diferencia=${prod.cantProducto}, cant_Actual=(select cant_Actual from Stock_Bodega where idProducto=${prod.idProducto} and idBodega='${body.idAlmacen}') ${operator} ${prod.cantProducto},
            fechaActualizacion='${dateResult}' where idProducto=${prod.idProducto} and idBodega='${body.idAlmacen}'
            update Stock_Agencia set cant_Anterior=(select cant_Actual from Stock_Agencia where idProducto=${prod.idProducto} and idAgencia='${body.idAlmacen}'), 
            diferencia=${prod.cantProducto}, cant_Actual=(select cant_Actual from Stock_Agencia where idProducto=${prod.idProducto} and idAgencia='${body.idAlmacen}') ${operator} ${prod.cantProducto},
            fechaActualizacion='${dateResult}' where idProducto=${prod.idProducto} and idAgencia='${body.idAlmacen}'
            update Stock_Agencia_Movil set cant_Anterior=(select cant_Actual from Stock_Agencia_Movil where idProducto=${prod.idProducto} and idVehiculo='${body.idAlmacen}'), 
            diferencia=${prod.cantProducto}, cant_Actual=(select cant_Actual from Stock_Agencia_Movil where idProducto=${prod.idProducto} and idVehiculo='${body.idAlmacen}') ${operator} ${prod.cantProducto},
            fechaActualizacion='${dateResult}' where idProducto=${prod.idProducto} and idVehiculo='${body.idAlmacen}'`;
                const updated = await dbConnection.executeQuery(
                  updateStockQuery
                );
                console.log("Query de updateo", updateStockQuery);
                console.log("Updated", updated);
                if (updated.success) {
                  console.log("Actualizado correctamente");
                }
                resolve({
                  data: updated,
                  code: 200,
                });
              }, 200);
            });
          })
          .catch((error) => {
            console.log("Error al verificar", error);
            reject({
              code: 400,
              data: error,
              message:
                "Alguno de los productos no tiene disponible la cantidad solicitada, intente nuevamente",
            });
          });
      }
    } else {
      setTimeout(() => {
        resolve(
          JSON.stringify({
            code: 200,
            data: "No product to modify",
          })
        );
      }, 200);
    }
  });
}

async function verifyStock(body) {
  return new Promise(async (resolve, reject) => {
    for (const prod of body.productos) {
      const validado = await getStockFromDB(
        prod.idProducto,
        body.idAlmacen,
        prod.cantProducto
      );
      console.log("Cantidad validada", validado);
      if (validado < 0) {
        reject(false);
      }
    }
    resolve(true);
  });
}

async function getStockFromDB(idProducto, idAlmacen, cantProducto) {
  return new Promise((resolve) => {
    console.log(`Getting stock from product ${idProducto}...`);
    setTimeout(async () => {
      let verifyQuery = `select cant_Actual-${cantProducto} as resto from Stock_Bodega where idBodega='${idAlmacen}' and idProducto=${idProducto} union 
        select cant_Actual-${cantProducto} as resto from Stock_Agencia where idAgencia='${idAlmacen}' and idProducto=${idProducto} union
        select cant_Actual-${cantProducto} as resto from Stock_Agencia_Movil where idVehiculo='${idAlmacen}' and idProducto=${idProducto}`;
      const verified = await dbConnection.executeQuery(verifyQuery);
      resolve(verified.data[0][0].resto);
    }, 200);
  });
}

function verifyAvailability(body) {
  return new Promise((resolve, reject) => {
    body.productos.map((product) => {
      setTimeout(async () => {
        let verifyQuery = `select cant_Actual-${product.cantidad} as disponible from Stock_Bodega where idProducto=${product.idProducto} and idBodega='${product.idAlmacen}' 
        union select cant_Actual-${product.cantidad} as disponible from Stock_Agencia where idProducto=${product.idProducto} and idAgencia='${product.idAlmacen}'
        union select cant_Actual-${product.cantidad} as disponible from Stock_Agencia_Movil where idProducto=${product.idProducto} and idVehiculo='${product.idAlmacen}'`;
        const available = await dbConnection.executeQuery(verifyQuery);
        if (available.data[0][0].disponible > 0) {
          reject({
            message: "No hay",
          });
        }
      }, 100);
      resolve(available.data[0][0]);
    });
  });
}

module.exports = {
  getStores,
  getUserStock,
  verifyAvailability,
  updateProductStock,
};
