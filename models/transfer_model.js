const { client } = require("../postgressConn");
const dbConnection = require("../server");
const dateString = require("../services/dateServices");
const { transactionOfUpdateStocks } = require("./store_model");

function createTransfer(body) {
  const dateResult = dateString();
  console.log("body del traspasos", body);
  const movil = body.movil ? body.movil : 0;
  const imp = body.impreso != undefined ? body.impreso : 0;
  console.log("Imp", imp);
  var queryTransfer = `insert into Traspasos (fechaCrea, fechaActu, idOrigen, idDestino, idUsuario, estado, movil, listo, impreso, transito)
    values ('${dateResult}','','${body.idOrigen}','${body.idDestino}',${body.idUsuario},0,${movil},0,${imp},${body.transito})`;
  return new Promise((resolve, reject) => {
    console.log("Query traspaso", queryTransfer);
    setTimeout(async () => {
      const newTransfer = await dbConnection.executeQuery(queryTransfer);
      if (newTransfer.success) {
        const idCreado = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Traspasos') as 'idCreado'`
        );
        body.productos.map((productos) => {
          var queryProds = `insert into Traspaso_Producto (idTraspaso, idProducto, cantidadProducto, cantidadRestante) 
                    values (${idCreado.data[0][0].idCreado},${productos.idProducto},${productos.cantProducto},${productos.cantidadRestante})`;
          console.log("Query productos", queryProds);
          setTimeout(async () => {
            const addedProd = await dbConnection.executeQuery(queryProds);
            if (addedProd.success) {
              resolve(
                JSON.stringify({
                  code: 201,
                  data: {
                    idCreado: idCreado.data[0][0].idCreado,
                  },
                })
              );
            } else {
              const del = await dbConnection.executeQuery(
                `delete from Pedidos where idPedido=${idCreado.data[0][0].idCreado}`
              );
              del
                .then(() => {
                  reject(
                    JSON.stringify({
                      code: 400,
                      data: "Error",
                      message: "Productos: " + addedProd.message,
                    })
                  );
                })
                .catch((err) => {
                  throw err;
                });
            }
          }, 200);
        });
      } else {
        reject(
          JSON.stringify({
            code: 400,
            data: "Error",
            message: "Traspaso: " + newTransfer.message,
          })
        );
      }
    }, 1000);
  });
}
function getTransferList(params) {
  console.log("Criterio", params.crit);
  if (params.crit === "todo") {
    console.log("Sacar todas");
  } else {
    console.log("Sacar especificas");
  }
  var criteria =
    params.crit === "todo"
      ? ``
      : params.crit === "ac"
        ? `where estado>0 and movil=0`
        : `where estado=0 and movil=0`;
  var queryGetList = `select a.estado, a.impreso, a.listo, a.idUsuario, b.nombre as nombreOrigen, a.idOrigen, a.idDestino,
    (select x.nombre from Agencias x where x.idAgencia=a.idDestino union 
    select x.nombre from Bodegas x where x.idBodega=a.idDestino union 
    select 'Agencia Movil '+x.placa from Vehiculos x where x.placa=a.idDestino) 
    as nombreDestino, a.idTraspaso, a.fechaCrea, f.correo, a.nroOrden, 
    f.nombre+ ' '+f.apPaterno+' '+f.apMaterno as nombreCompleto
    from Traspasos a 
    inner join Agencias b on a.idOrigen=b.idAgencia 
    inner join Usuarios f on a.idUsuario=f.idUsuario
    ${criteria}
    union
    select a.estado, a.impreso, a.listo, a.idUsuario, b.nombre as nombreOrigen, a.idOrigen, a.idDestino,
    (select x.nombre from Agencias x where x.idAgencia=a.idDestino union 
    select x.nombre from Bodegas x where x.idBodega=a.idDestino union 
    select 'Agencia Movil '+x.placa from Vehiculos x where x.placa=a.idDestino) 
    as nombreDestino, a.idTraspaso, a.fechaCrea, f.correo ,a.nroOrden,
     f.nombre+ ' '+f.apPaterno+' '+f.apMaterno as nombreCompleto
    from Traspasos a 
    inner join Bodegas b on a.idOrigen=b.idBodega 
    inner join Usuarios f on a.idUsuario=f.idUsuario
    ${criteria}
    union 
    select a.estado, a.impreso, a.listo, a.idUsuario,'Agencia movil '+b.placa as nombreOrigen, a.idOrigen, a.idDestino,
    (select x.nombre from Agencias x where x.idAgencia=a.idDestino union 
    select x.nombre from Bodegas x where x.idBodega=a.idDestino union 
    select 'Agencia Movil '+x.placa from Vehiculos x where x.placa=a.idDestino) 
    as nombreDestino, a.idTraspaso, a.fechaCrea, f.correo, a.nroOrden, f.nombre+ ' '+f.apPaterno+' '+f.apMaterno as nombreCompleto
    from Traspasos a 
    inner join Vehiculos b on a.idOrigen=b.placa 
    inner join Usuarios f on a.idUsuario=f.idUsuario
    ${criteria}
    order by a.idTraspaso desc`;
  return new Promise((resolve) => {
    console.log("Query", queryGetList);
    setTimeout(async () => {
      const list = await dbConnection.executeQuery(queryGetList);
      resolve({
        response: list,
        code: 200,
      });
    }, 500);
  });
}
function getTransferProducts(params) {
  var queryProds = `select tr.*, tr.cantidadProducto as cantProducto, pr.codInterno, pr.nombreProducto from Traspaso_Producto tr inner join Productos pr on tr.idProducto=pr.idProducto where tr.idTraspaso=${params.id}`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const list = await dbConnection.executeQuery(queryProds);
      resolve({
        response: list,
        code: 200,
      });
    }, 500);
  });
}
function updateTransfer(body) {
  const dateResult = dateString();
  var queryUpdate = `update Traspasos set estado=${body.estado}, fechaActu='${dateResult}' where idTraspaso=${body.idTraspaso}`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const update = await dbConnection.executeQuery(queryUpdate);
      resolve({
        response: update,
        code: 200,
      });
    }, 500);
  });
}
function printTransfer(params) {
  const query = `update Traspasos set impreso=1 where idTraspaso=${params.id}`;
  console.log("Query query", query);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const printed = await dbConnection.executeQuery(query);
      if (printed.success) {
        resolve(printed);
      } else {
        reject(printed);
      }
    }, 100);
  });
}
function toRePrintDetails(params) {
  const query = `select tr.idTraspaso, tr.fechaCrea, us.usuario, pr.codInterno, pr.nombreProducto ,tp.cantidadProducto from Traspasos tr 
  inner join Traspaso_Producto tp on tr.idTraspaso=tp.idTraspaso
  inner join Productos pr on pr.idProducto=tp.idProducto 
  inner join Usuarios us on us.idUsuario=tr.idUsuario
  where tr.idTraspaso=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const printed = await dbConnection.executeQuery(query);
      if (printed.success) {
        resolve(printed);
      } else {
        reject(printed);
      }
    }, 100);
  });
}

function changeReady(params) {
  const query = `update Traspasos set listo=${params.listo} where idTraspaso=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const changed = await dbConnection.executeQuery(query);
      if (changed.success) {
        resolve(changed);
      } else {
        reject(changed);
      }
    }, 100);
  });
}

function addProductToTransfer(body) {
  console.log("Body", body);
  return new Promise((resolve, reject) => {
    if (body.productos.length < 1) {
      resolve("no products to add");
    } else {
      body.productos.map((pr) => {
        setTimeout(async () => {
          const query = `insert into Traspaso_Producto (idTraspaso, idProducto, cantidadProducto, cantidadRestante) values 
          ( ${body.idTraspaso}, ${pr.idProducto}, ${pr.cantProducto}, ${pr.cantidadRestante} )`;
          const added = await dbConnection.executeQuery(query);
          if (added.success) {
            resolve(added);
          } else {
            reject(added);
          }
        }, 100);
      });
    }
  });
}

function deleteProductFromTransfer(params) {
  console.log("Parameters", params);
  const body = JSON.parse(params.body);
  console.log("Llego hasta aca, model", body);
  return new Promise((resolve, reject) => {
    if (body.productos.length < 1) {
      resolve("no products to add");
    } else {
      body.productos.map((pr) => {
        setTimeout(async () => {
          const query = `delete from Traspaso_Producto where idTraspaso=${body.idTraspaso} and idProducto=${pr.idProducto}`;
          console.log("Query deleteo", query);
          const added = await dbConnection.executeQuery(query);
          if (added.success) {
            resolve(added);
          } else {
            reject(added);
          }
        }, 100);
      });
    }
  });
}

function updateProductInTransfer(body) {
  return new Promise((resolve, reject) => {
    body.productos.map((pr) => {
      setTimeout(async () => {
        const query = `update Traspaso_Producto set cantidadProducto=${pr.cantProducto}, cantidadRestante=${pr.cantidadRestante} where idTraspaso=${body.idTraspaso} and idProducto=${pr.idProducto}`;
        const added = await dbConnection.executeQuery(query);
        if (added.success) {
          resolve(added);
        } else {
          reject(added);
        }
      }, 100);
    });
  });
}

function updateChangedTransfer(body) {
  const imp = body.impreso != undefined ? body.impreso : 0;
  const query = `update Traspasos set fechaActu='${body.fechaActualizacion}', listo=0, impreso=${imp}, estado=0 where idTraspaso=${body.idTraspaso}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const updated = await dbConnection.executeQuery(query);
      if (updated.success) {
        resolve(updated);
      } else {
        reject(updated);
      }
    }, 100);
  });
}

function getTransitTransfers(params) {
  const query = `select tr.*, tp.cantidadProducto, pr.nombreProducto, pr.codInterno, pr.idProducto, us.usuario from Traspasos tr
  inner join Traspaso_Producto tp on tp.idTraspaso=tr.idTraspaso
  inner join Productos pr on pr.idProducto=tp.idProducto
  inner join Usuarios us on us.idUsuario=tr.idUsuario
  where tr.transito=0 and  ((tr.listo=1) or (tr.estado=1)) and tr.idDestino='${params.storeId}'`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const list = await dbConnection.executeQuery(query);
      if (list.success) {
        resolve(list);
      } else {
        reject(list);
      }
    }, 100);
  });
}

function acceptTransfer(params) {
  const query = `update Traspasos set transito=1 where idTraspaso=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const updated = await dbConnection.executeQuery(query);
      if (updated.success) {
        resolve(updated);
      } else {
        reject(updated);
      }
    }, 100);
  });
}

//POSTGRESS

function createTransferPos(body) {
  const dateResult = dateString();
  console.log("body del traspaso", body);
  const { listo } = body;
  const movil = body.movil ? body.movil : 0;
  const imp = body.impreso != undefined ? body.impreso : 0;

  const queryTransfer = `
  INSERT INTO Traspasos ("fechaCrea", "fechaActu", "idOrigen", "idDestino", "idUsuario", estado, movil, listo, impreso, transito)
  VALUES ($1, '', $2, $3, $4, 0, $5, $6, $7, $8)
  RETURNING "idTraspaso";
`;

  // Assuming you are using a database library like 'pg'
  const values = [dateResult, body.idOrigen, body.idDestino, body.idUsuario, movil, listo === 1 ? listo : 0, imp, body.transito];

  return new Promise((resolve, reject) => {
    console.log("Query traspaso", queryTransfer, values);
    setTimeout(async () => {
      try {
        const newTransfer = await client.query(queryTransfer, values);
        const idCreado = newTransfer.rows[0].idTraspaso;
        const updatedId = `
          UPDATE Traspasos
          SET "nroOrden" = 'TRASPASO000' || $2
          WHERE "idTraspaso" = $1
        `;
        const upd = await client.query(updatedId, [idCreado, idCreado]);
        
        body.productos.map((productos) => {
          const queryProds = `
          INSERT INTO Traspaso_Producto ("idTraspaso", "idProducto", "cantidadProducto", "cantidadRestante")
          VALUES ($1, $2, $3, $4);
        `;

          // Assuming you have the values for the insert
          const values = [idCreado, productos.idProducto, productos.cantProducto, productos.cantidadRestante];
          setTimeout(async () => {
            try {
              const addedProd = await client.query(queryProds, values);

              resolve(
                JSON.stringify({
                  code: 201,
                  data: {
                    idCreado: idCreado,
                    added: addedProd.rows,
                  },
                })
              );
            } catch (err) {
              reject(
                JSON.stringify({
                  code: 400,
                  data: "Error",
                  message: "Productos: " + err,
                })
              );
              /*
              const del = await client.query(
                `delete from Pedidos where "idPedido"=${idCreado}`
              );
              del
                .then(() => {
                  reject(
                    JSON.stringify({
                      code: 400,
                      data: "Error",
                      message: "Productos: " + err,
                    })
                  );
                })
                .catch((err) => {
                  throw err;
                });*/
            }
          }, 100);
        });
      } catch (err) {
        reject(
          JSON.stringify({
            code: 400,
            data: "Error",
            message: "Traspaso: " + err,
          })
        );
      }
    }, 100);
  });
}

function getTransferListPos(params) {
  console.log("Criterio", params.crit);
  if (params.crit === "todo") {
    console.log("Sacar todas");
  } else {
    console.log("Sacar especificas");
  }
  var criteria =
    params.crit === "todo"
      ? ``
      : params.crit === "ac"
        ? `where estado>0 and movil=0`
        : `where estado='0' and movil=0`;
  var queryGetList = `select a.estado, a.impreso, a.listo, a."idUsuario", b.nombre as "nombreOrigen", a."idOrigen", a."idDestino",
    (select x.nombre from Agencias x where x."idAgencia"=a."idDestino" union 
    select x.nombre from Bodegas x where x."idBodega"=a."idDestino" union 
    select 'Agencia Movil '||x.placa from Vehiculos x where x.placa=a."idDestino") 
    as "nombreDestino", a."idTraspaso", a."fechaCrea", f.correo, a."nroOrden", 
    f.nombre|| ' '||f."apPaterno"||' '||f."apMaterno" as "nombreCompleto"
    from Traspasos a 
    inner join Agencias b on a."idOrigen"=b."idAgencia" 
    inner join Usuarios f on a."idUsuario"=f."idUsuario"
    ${criteria}
    union
    select a.estado, a.impreso, a.listo, a."idUsuario", b.nombre as "nombreOrigen", a."idOrigen", a."idDestino",
    (select x.nombre from Agencias x where x."idAgencia"=a."idDestino" union 
    select x.nombre from Bodegas x where x."idBodega"=a."idDestino" union 
    select 'Agencia Movil '||x.placa from Vehiculos x where x.placa=a."idDestino") 
    as "nombreDestino", a."idTraspaso", a."fechaCrea", f.correo ,a."nroOrden",
    f.nombre|| ' '||f."apPaterno"||' '||f."apMaterno" as "nombreCompleto"
    from Traspasos a 
    inner join Bodegas b on a."idOrigen"=b."idBodega" 
    inner join Usuarios f on a."idUsuario"=f."idUsuario"
    ${criteria}
    union 
    select a.estado, a.impreso, a.listo, a."idUsuario",'Agencia movil '||b.placa as "nombreOrigen", a."idOrigen", a."idDestino",
    (select x.nombre from Agencias x where x."idAgencia"=a."idDestino" union 
    select x.nombre from Bodegas x where x."idBodega"=a."idDestino" union 
    select 'Agencia Movil '||x.placa from Vehiculos x where x.placa=a."idDestino") 
    as "nombreDestino", a."idTraspaso", a."fechaCrea", f.correo, a."nroOrden", f.nombre|| ' '||f."apPaterno"||' '||f."apMaterno" as "nombreCompleto"
    from Traspasos a 
    inner join Vehiculos b on a."idOrigen"=b.placa 
    inner join Usuarios f on a."idUsuario"=f."idUsuario"
    ${criteria}
    order by "idTraspaso" desc`;
  return new Promise((resolve, reject) => {
    console.log("Query", queryGetList);
    setTimeout(async () => {
      try {
        const list = await client.query(queryGetList);
        resolve({
          response: list.rows,
          code: 200,
        });
      } catch (err) {
        reject({
          response: err,
          code: 200,
        });
      }
    }, 100);
  });
}

function getTransferProductsPos(params) {
  var queryProds = `select tr.*, tr."cantidadProducto" as "cantProducto", tr."cantidadProducto" as "cant_Anterior", pr."codInterno", pr."nombreProducto" from Traspaso_Producto tr inner join Productos pr on tr."idProducto"=pr."idProducto" where tr."idTraspaso"=${params.id}`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const list = await client.query(queryProds);
        resolve({
          response: list.rows,
          code: 200,
        });
      } catch (err) {
        console.log("error de la lista", err);
      }
    }, 500);
  });
}

async function updateTransferPos(body) {
  const { stock } = body;
  try {
    const dateResult = dateString();
    const queryUpdate = `UPDATE Traspasos SET estado=$1, "fechaActu"=$2 WHERE "idTraspaso"=$3`;
    const queryLog = `INSERT INTO Log_traspasos ("idTraspaso", "idUsuario", "fechaHora", estado) VALUES ($1, $2, $3, $4)`;

    await client.query("BEGIN");

    const update = await client.query(queryUpdate, [
      body.estado,
      dateResult,
      body.idTraspaso,
    ]);
    const logged = await client.query(queryLog, [
      body.idTraspaso,
      body.idUsuario,
      body.fechaHora,
      body.estado,
    ]);

    if (stock) {
      const updateProducts = await transactionOfUpdateStocks([stock], true);

      if (updateProducts.code !== 200) {
        throw updateProducts.response;
      }
    }

    await client.query("COMMIT");

    return {
      response: update.rows,
      code: 200,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating transfer position:", err);
    throw err;
  }
}

function printTransferPos(params) {
  const query = `update Traspasos set impreso=1 where "idTraspaso"=${params.id}`;
  console.log("Query query", query);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const printed = await client.query(query);
        resolve(printed.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function toRePrintDetailsPos(params) {
  const query = `select tr."idTraspaso", tr."fechaCrea", us.usuario, pr."codInterno", pr."nombreProducto" ,tp."cantidadProducto", '' as "notas",
  '' as "razonSocial", '' as "zona", 
  (select nombre from Agencias where "idAgencia"=tr."idOrigen" union
   select nombre from Bodegas where "idBodega"=tr."idOrigen" union 
   select placa from Vehiculos where placa=tr."idOrigen") as origen,
    (select nombre from Agencias where "idAgencia"=tr."idDestino" union
   select nombre from Bodegas where "idBodega"=tr."idDestino" union 
   select placa from Vehiculos where placa=tr."idDestino") as destino
  from Traspasos tr 
  inner join Traspaso_Producto tp on tr."idTraspaso"=tp."idTraspaso"
  inner join Productos pr on pr."idProducto"=tp."idProducto" 
  inner join Usuarios us on us."idUsuario"=tr."idUsuario"
  where tr."idTraspaso"=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const printed = await client.query(query);
        resolve(printed.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function changeReadyPos(params) {
  const isInterior = params.interior == 1 ? `, estado=1` : "";
  const query = `update Traspasos set listo=${params.listo} ${isInterior} where "idTraspaso"=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const changed = await client.query(query);
        resolve(changed.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function addProductToTransferPos(body) {
  console.log("Body", body);
  return new Promise((resolve, reject) => {
    if (body.productos.length < 1) {
      resolve("no products to add");
    } else {
      body.productos.map((pr) => {
        setTimeout(async () => {
          const query = `insert into Traspaso_Producto ("idTraspaso", "idProducto", "cantidadProducto", "cantidadRestante") values 
          ( ${body.idTraspaso}, ${pr.idProducto}, ${pr.cantProducto}, ${pr.cantidadRestante} )`;
          try {
            const added = await client.query(query);
            resolve(added.rows);
            console.log("llego aca?");
          } catch (err) {
            console.log("Error en el back", err);
            reject(err);
          }
        }, 100);
      });
    }
  });
}

function deleteProductFromTransferPos(params) {
  const body = JSON.parse(params.body);
  console.log("Llego hasta aca, model", body);
  return new Promise((resolve, reject) => {
    if (body.productos.length < 1) {
      resolve("no products to add");
    } else {
      body.productos.map((pr) => {
        setTimeout(async () => {
          const query = `delete from Traspaso_Producto where "idTraspaso"=${body.idTraspaso} and "idProducto"=${pr.idProducto}`;
          console.log("Query deleteo", query);
          try {
            const added = await client.query(query);
            resolve(added.rows);
          } catch (err) {
            reject(err);
          }
        }, 100);
      });
    }
  });
}

function updateProductInTransferPos(body) {
  console.log("Body", body);
  return new Promise((resolve, reject) => {
    body.productos.map((pr) => {
      setTimeout(async () => {
        const query = `update Traspaso_Producto set "cantidadProducto"=${pr.cantProducto}, "cantidadRestante"=${pr.cantidadRestante} where "idTraspaso"=${body.idTraspaso} and "idProducto"=${pr.idProducto}`;
        try {
          const added = await client.query(query);
          resolve(added.rows);
        } catch (err) {
          reject(err);
        }
      }, 100);
    });
  });
}

function updateChangedTransferPos(body) {
  const imp = body.impreso != undefined ? body.impreso : 0;
  const query = `update Traspasos set "fechaActu"='${body.fechaActualizacion}', listo=0, impreso=${imp}, estado='0' where "idTraspaso"=${body.idTraspaso}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const updated = await client.query(query);
        resolve(updated.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getTransitTransfersPos(params) {
  const query = `select tr.*, tp."cantidadProducto", pr."nombreProducto", pr."codInterno", pr."idProducto", us.usuario from Traspasos tr
  inner join Traspaso_Producto tp on tp."idTraspaso"=tr."idTraspaso"
  inner join Productos pr on pr."idProducto"=tp."idProducto"
  inner join Usuarios us on us."idUsuario"=tr."idUsuario"
  where tr.transito=0 and  ((tr.listo=1) or (tr.estado=1)) and tr."idDestino"='${params.storeId}' and estado!=2`;
  return new Promise((resolve, reject) => {
    console.log("Query de transito ", query);
    setTimeout(async () => {
      try {
        const list = await client.query(query);
        resolve(list.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function acceptTransferPos(params) {
  const query = `update Traspasos set transito=1 where "idTraspaso"=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const updated = await client.query(query);
        resolve(updated.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function deleteTransferData(params) {
  const query = `delete from Traspasos where "idTraspaso"=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        client.query("BEGIN");
        const updated = await client.query(query);
        resolve(updated.rows);
        client.query("COMMIT");
      } catch (err) {
        client.query("ROLLBACK");
        reject(err);
      }
    }, 100);
  });
}

module.exports = {
  createTransfer,
  getTransferList,
  getTransferProducts,
  updateTransfer,
  printTransfer,
  toRePrintDetails,
  changeReady,
  addProductToTransfer,
  deleteProductFromTransfer,
  updateProductInTransfer,
  updateChangedTransfer,
  getTransitTransfers,
  acceptTransfer,
  createTransferPos,
  getTransferListPos,
  getTransferProductsPos,
  updateTransferPos,
  printTransferPos,
  toRePrintDetailsPos,
  changeReadyPos,
  addProductToTransferPos,
  deleteProductFromTransferPos,
  updateProductInTransferPos,
  updateChangedTransferPos,
  getTransitTransfersPos,
  acceptTransferPos,
  deleteTransferData,
};
