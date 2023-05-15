const { client } = require("../postgressConn");
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
    }, 1000);
  });
}

function getOnlyStores() {
  let storeQuery = `select idAgencia + ' ' + nombre as Nombre, idAgencia from Agencias `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const stores = await dbConnection.executeQuery(storeQuery);
      resolve(JSON.stringify(stores.data));
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

  return new Promise((resolve, reject) => {
    if (body.productos.length > 0) {
      if (body.accion === "add") {
        body.productos.map((prod) => {
          setTimeout(async () => {
            let updateStockQuery = `
            update Stock_Bodega set 
            cant_Anterior=(select cant_Actual from Stock_Bodega where idProducto=${prod.idProducto} and idBodega='${body.idAlmacen}'), 
            diferencia=${prod.cantProducto}, 
            cant_Actual=(select cant_Actual from Stock_Bodega where idProducto=${prod.idProducto} and idBodega='${body.idAlmacen}') ${operator} ${prod.cantProducto},
            fechaActualizacion='${dateResult}' where idProducto=${prod.idProducto} and idBodega='${body.idAlmacen}';
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
                const updated = await dbConnection.executeQuery(
                  updateStockQuery
                );

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
            reject({
              faltantes: error,
              code: 200,
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
    var faltantes = 0;
    var disponibles = 0;
    for (const prod of body.productos) {
      const validado = await getStockFromDBPos(
        prod.idProducto,
        body.idAlmacen,
        prod.cantProducto
      );

      if (validado.resto < 0) {
        faltantes = faltantes + 1;
      } else {
        disponibles = disponibles + 1;
      }
    }
    if (faltantes > 0) {
      reject(false);
    } else {
      resolve(true);
    }
  });
}

async function getStockFromDB(idProducto, idAlmacen, cantProducto) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      let verifyQuery = `select cant_Actual-${cantProducto} as resto, cant_Actual as disponible from Stock_Bodega where idBodega='${idAlmacen}' and idProducto=${idProducto} union 
        select cant_Actual-${cantProducto} as resto, cant_Actual as disponible from Stock_Agencia where idAgencia='${idAlmacen}' and idProducto=${idProducto} union
        select cant_Actual-${cantProducto} as resto, cant_Actual as disponible from Stock_Agencia_Movil where idVehiculo='${idAlmacen}' and idProducto=${idProducto}`;
      const verified = await dbConnection.executeQuery(verifyQuery);
      resolve({
        resto: verified.data[0][0].resto,
        disponible: verified.data[0][0].disponible,
      });
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

function updateFullStock(body) {
  return new Promise((resolve, reject) => {
    body.products.map((pr) => {
      setTimeout(async () => {
        let updateQuery = `update Stock_Agencia set cant_Anterior=(select cant_Actual from Stock_Agencia 
          where idProducto=${pr.idProducto} and idAgencia='${body.idAgencia}'), cant_Actual='${pr.cantProducto}', 
          diferencia=abs(${pr.cantProducto}-cant_Actual), fechaActualizacion='${body.fechaHora}' where idProducto=${pr.idProducto} 
            update Stock_Bodega set cant_Anterior=(select cant_Actual from Stock_Bodega 
            where idProducto=${pr.idProducto} and idBodega='${body.idAgencia}'), cant_Actual='${pr.cantProducto}', 
            diferencia=abs(${pr.cantProducto}-cant_Actual), fechaActualizacion='${body.fechaHora}' where idProducto=${pr.idProducto} 
              update Stock_Agencia_Movil set cant_Anterior=(select cant_Actual from Stock_Agencia_Movil 
              where idProducto=${pr.idProducto} and idVehiculo='${body.idAgencia}'), cant_Actual='${pr.cantProducto}', 
              diferencia=abs(${pr.cantProducto}-cant_Actual), fechaActualizacion='${body.fechaHora}' where idProducto=${pr.idProducto}`;
        const updated = await dbConnection.executeQuery(updateQuery);
        resolve({
          data: updated,
          code: 200,
        });
      }, 100);
    });
  });
}

function getSalePoints(params) {
  const pointQuery = `select * from PuntosDeVenta pdv inner join Sucursales sc on sc.idSucursal=pdv.idSucursal 
  where sc.idString='${params.idAgencia}'`;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const pointList = await dbConnection.executeQuery(pointQuery);
      console.log("Lista lista", pointList);
      if (pointList.success) {
        resolve(pointList);
      } else {
        reject(pointList);
      }
    }, 100);
  });
}

function getSalePointsAndStore(params) {
  const pointQuery = ` select ag.nombre, pdv.nroPuntoDeVenta from Agencias ag 
inner join Sucursales sc on ag.idAgencia=sc.idString 
inner join PuntosDeVenta pdv on pdv.idSucursal=sc.idSucursal
where sc.idString='${params.idAlmacen}' union 
select ag.nombre, pdv.nroPuntoDeVenta from Bodegas ag 
inner join Sucursales sc on ag.idBodega=sc.idString 
inner join PuntosDeVenta pdv on pdv.idSucursal=sc.idSucursal
where sc.idString='${params.idAlmacen}'
`;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const pointList = await dbConnection.executeQuery(pointQuery);

      if (pointList.success) {
        resolve(pointList);
      } else {
        reject(pointList);
      }
    }, 100);
  });
}

//POSTGRES

function getStoresPos() {
  let storeQuery = `select "idAgencia" || ' ' || nombre as "Nombre", "idAgencia" from Agencias union select placa as Nombre, placa  from Vehiculos union select "idBodega" || ' ' || nombre as "Nombre", "idBodega" from Bodegas`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const stores = await client.query(storeQuery);
      resolve(JSON.stringify(stores.rows));
    }, 1000);
  });
}

function getOnlyStoresPos() {
  let storeQuery = `select "idAgencia" || ' ' || nombre as "Nombre", "idAgencia" from Agencias `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const stores = await client.query(storeQuery);
      resolve(JSON.stringify(stores.rows));
    }, 100);
  });
}

function getUserStockPos(params) {
  let stockQuery = `select a.*, c."idUsuario" from Stock_Bodega a, Productos b, Usuarios c where a."idBodega"=c."idAlmacen" and b."idProducto"=a."idProducto" 
  and c."idUsuario"=${params.id} union 
  select a.*, c."idUsuario" from Stock_Agencia a, Productos b, Usuarios c where a."idAgencia"=c."idAlmacen" and b."idProducto"=a."idProducto" 
  and c."idUsuario"=${params.id} union 
  select a.*, c."idUsuario" from Stock_Agencia_Movil a, Productos b, Usuarios c where a."idVehiculo"=c."idAlmacen" and b."idProducto"=a."idProducto" 
  and c."idUsuario"=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const stores = await client.query(stockQuery);
      resolve(JSON.stringify(stores.rows));
    }, 100);
  });
}

function updateProductStockPos(body) {
  const dateResult = dateString();
  const operator = body.accion === "add" ? "+" : "-";
  return new Promise(async (resolve, reject) => {
    if (body.productos.length > 0) {
      if (body.accion === "add") {
        const rowList = [];
        const errList = [];
        for (const prod of body.productos) {
          const updateStockQuery = `
        update Stock_Bodega set 
          "cant_Anterior"= "cant_Actual", 
          diferencia=${prod.cantProducto}, 
          "cant_Actual"="cant_Actual" ${operator} ${prod.cantProducto},
          "fechaActualizacion"='${dateResult}' 
        where "idProducto"=${prod.idProducto} and "idBodega"='${body.idAlmacen}';
        update Stock_Agencia set 
          "cant_Anterior"= "cant_Actual", 
          diferencia=${prod.cantProducto}, 
          "cant_Actual"= "cant_Actual" ${operator} ${prod.cantProducto},
            "fechaActualizacion"='${dateResult}' 
        where "idProducto"=${prod.idProducto} and "idAgencia"='${body.idAlmacen}';
        update Stock_Agencia_Movil set 
          "cant_Anterior"="cant_Actual", 
            diferencia=${prod.cantProducto}, 
          "cant_Actual"="cant_Actual" ${operator} ${prod.cantProducto},
            "fechaActualizacion"='${dateResult}' 
        where "idProducto"=${prod.idProducto} and "idVehiculo"='${body.idAlmacen}';`;
          console.log("Query de updateo para AGREGAR", updateStockQuery);
          try {
            const updated = await client.query(updateStockQuery);
            const query = `insert into log_stock_change ("idProducto", "cantidadProducto", "idAgencia", "fechaHora","accion", "detalle")
                values (${prod.idProducto},${prod.cantProducto},'${body.idAlmacen}', '${dateResult}', '${operator}', '${body.detalle}')`;
            console.log("Query de log", query);
            await client.query(query);
            rowList.push(updated.rows);
          } catch (err) {
            console.log("error", err);
            errList.push(err);
          }
        }
        if (rowList.length === body.productos.length) {
          resolve({
            data: rowList,
            code: 200,
          });
        } else {
          reject(errList);
        }
      } else {
        const verification = verifyStock(body);
        verification
          .then(async (response) => {
            const rowList = [];
            const errList = [];
            for (const prod of body.productos) {
              const updateStockQuery = `
              update Stock_Bodega set 
                "cant_Anterior"= "cant_Actual", 
                diferencia=${prod.cantProducto}, 
                "cant_Actual"="cant_Actual" ${operator} ${prod.cantProducto},
                "fechaActualizacion"='${dateResult}' 
              where "idProducto"=${prod.idProducto} and "idBodega"='${body.idAlmacen}';
              update Stock_Agencia set 
                "cant_Anterior"= "cant_Actual", 
                diferencia=${prod.cantProducto}, 
                "cant_Actual"= "cant_Actual" ${operator} ${prod.cantProducto},
                "fechaActualizacion"='${dateResult}' 
              where "idProducto"=${prod.idProducto} and "idAgencia"='${body.idAlmacen}';
              update Stock_Agencia_Movil set 
                "cant_Anterior"="cant_Actual", 
                diferencia=${prod.cantProducto}, 
                "cant_Actual"="cant_Actual" ${operator} ${prod.cantProducto},
                "fechaActualizacion"='${dateResult}' 
              where "idProducto"=${prod.idProducto} and "idVehiculo"='${body.idAlmacen}';`;
              console.log("Query de updateo para AGREGAR", updateStockQuery);
              try {
                const updated = await client.query(updateStockQuery);
                const query = `insert into log_stock_change ("idProducto", "cantidadProducto", "idAgencia", "fechaHora","accion", "detalle")
                    values (${prod.idProducto},${prod.cantProducto},'${body.idAlmacen}', '${dateResult}', '${operator}','${body.detalle}')`;
                console.log("Query de log", query);
                await client.query(query);
                rowList.push(updated.rows);
              } catch (err) {
                console.log("error", err);
                errList.push(err);
              }
            }
            if (rowList.length === body.productos.length) {
              resolve({
                data: rowList,
                code: 200,
              });
            } else {
              reject(errList);
            }
          })
          .catch((error) => {
            reject({
              faltantes: error.faltantes,
              code: 200,
              error: error,
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

function verifyAvailabilityPos(body) {
  return new Promise((resolve, reject) => {
    body.productos.map((product) => {
      setTimeout(async () => {
        let verifyQuery = `select "cant_Actual"-${product.cantidad} as disponible from Stock_Bodega where "idProducto"=${product.idProducto} and "idBodega"='${product.idAlmacen}' 
        union select "cant_Actual"-${product.cantidad} as disponible from Stock_Agencia where "idProducto"=${product.idProducto} and "idAgencia"='${product.idAlmacen}'
        union select "cant_Actual"-${product.cantidad} as disponible from Stock_Agencia_Movil where "idProducto"=${product.idProducto} and "idVehiculo"='${product.idAlmacen}'`;
        const available = await client.query(verifyQuery);
        if (available.rows[0].disponible > 0) {
          reject({
            message: "No hay",
          });
        }
      }, 100);
      resolve(available.rows);
    });
  });
}

async function getStockFromDBPos(idProducto, idAlmacen, cantProducto) {
  return new Promise((resolve) => {
    console.log(`Getting stock from product ${idProducto}...`);
    setTimeout(async () => {
      let verifyQuery = `select "cant_Actual"-${cantProducto} as resto, "cant_Actual" as disponible from Stock_Bodega where "idBodega"='${idAlmacen}' and "idProducto"=${idProducto} union 
        select "cant_Actual"-${cantProducto} as resto, "cant_Actual" as disponible from Stock_Agencia where "idAgencia"='${idAlmacen}' and "idProducto"=${idProducto} union
        select "cant_Actual"-${cantProducto} as resto, "cant_Actual" as disponible from Stock_Agencia_Movil where "idVehiculo"='${idAlmacen}' and "idProducto"=${idProducto}`;
      const verified = await client.query(verifyQuery);
      console.log("Flag query", verifyQuery);
      resolve({
        resto: verified.rows[0].resto,
        disponible: verified.rows[0].disponible,
      });
    }, 200);
  });
}

function updateFullStockPos(body) {
  return new Promise((resolve, reject) => {
    body.products.map((pr) => {
      setTimeout(async () => {
        let updateQuery = `update Stock_Agencia set "cant_Anterior"=(select "cant_Actual" from Stock_Agencia 
          where "idProducto"=${pr.idProducto} and "idAgencia"='${body.idAgencia}'), "cant_Actual"='${pr.cantProducto}', 
          diferencia=abs(${pr.cantProducto}-"cant_Actual"), "fechaActualizacion"='${body.fechaHora}' where "idProducto"=${pr.idProducto}; 
            update Stock_Bodega set "cant_Anterior"=(select "cant_Actual" from Stock_Bodega 
            where "idProducto"=${pr.idProducto} and "idBodega"='${body.idAgencia}'), "cant_Actual"='${pr.cantProducto}', 
            diferencia=abs(${pr.cantProducto}-"cant_Actual"), "fechaActualizacion"='${body.fechaHora}' where "idProducto"=${pr.idProducto}; 
              update Stock_Agencia_Movil set "cant_Anterior"=(select "cant_Actual" from Stock_Agencia_Movil 
              where "idProducto"=${pr.idProducto} and "idVehiculo"='${body.idAgencia}'), "cant_Actual"='${pr.cantProducto}', 
              diferencia=abs(${pr.cantProducto}-"cant_Actual"), "fechaActualizacion"='${body.fechaHora}' where "idProducto"=${pr.idProducto};`;
        console.log("Query full stock", updateQuery);
        try {
          const updated = await client.query(updateQuery);
          resolve({
            data: updated.rows,
            code: 200,
          });
        } catch (err) {
          console.log("Error full stock", err);
          reject(err);
        }
      }, 100);
    });
  });
}

function getSalePointsPos(params) {
  const pointQuery = `select * from PuntosDeVenta pdv inner join Sucursales sc on sc."idSucursal"=pdv."idSucursal" 
  where sc."idString"='${params.idAgencia}'`;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const pointList = await client.query(pointQuery);

      try {
        resolve(pointList.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getSalePointsAndStorePos(params) {
  const pointQuery = ` select ag.nombre, pdv."nroPuntoDeVenta", ag."idAgencia" as "idAgencia" from Agencias ag 
inner join Sucursales sc on ag."idAgencia"=sc."idString" 
inner join PuntosDeVenta pdv on pdv."idSucursal"=sc."idSucursal"
where sc."idString"='${params.idAlmacen}' union 
select ag.nombre, pdv."nroPuntoDeVenta", ag."idBodega" as "idAgencia" from Bodegas ag 
inner join Sucursales sc on ag."idBodega"=sc."idString" 
inner join PuntosDeVenta pdv on pdv."idSucursal"=sc."idSucursal"
where sc."idString"='${params.idAlmacen}'
`;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const pointList = await client.query(pointQuery);

      try {
        resolve(pointList.rows);
      } catch (err) {
        reject(pointList);
      }
    }, 100);
  });
}

function getMobileSalePointsPos(params) {
  var pointQuery;
  if (params.idAgencia != "") {
    pointQuery = `select "idAgencia", "idSucursal","nroPuntoDeVenta" from pdvAgMovil pa 
    inner join puntosdeventa pdv on pdv."idPuntoDeVenta"=pa.pdv where "idAgencia"='${params.idAgencia}';`;
  } else {
    pointQuery = `select "idAgencia", "idSucursal","nroPuntoDeVenta" from pdvAgMovil pa 
    inner join puntosdeventa pdv on pdv."idPuntoDeVenta"=pa.pdv;`;
  }
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const pointList = await client.query(pointQuery);
      try {
        resolve(pointList.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getAllStores() {
  const pointQuery = `select "idAgencia" as idAgencia, "nombre" from Agencias union
  select "idBodega" as idAgencia, nombre from Bodegas union
  select "placa" as "idAgencia", placa from Vehiculos`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const pointList = await client.query(pointQuery);
      try {
        resolve(pointList.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

module.exports = {
  getStores,
  getUserStock,
  verifyAvailability,
  updateProductStock,
  updateFullStock,
  getOnlyStores,
  getSalePoints,
  getSalePointsAndStore,
  getStoresPos,
  getOnlyStoresPos,
  getUserStockPos,
  updateProductStockPos,
  verifyAvailabilityPos,
  updateFullStockPos,
  getSalePointsPos,
  getSalePointsAndStorePos,
  getMobileSalePointsPos,
  getAllStores,
};
