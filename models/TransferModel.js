const dbConnection = require("../server");
const dateString = require("../services/dateServices");

function createTransfer(body) {
  const dateResult = dateString();
  console.log("Resultado fecha", dateResult);
  var queryTransfer = `insert into Traspasos (fechaCrea, fechaActu, idOrigen, idDestino, idUsuario, estado)
    values ('${dateResult}','','${body.idOrigen}','${body.idDestino}',${body.idUsuario},0)`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const newTransfer = await dbConnection.executeQuery(queryTransfer);
      if (newTransfer.success) {
        const idCreado = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Traspasos') as 'idCreado'`
        );
        body.productos.map((productos) => {
          var queryProds = `insert into Traspaso_Producto (idTraspaso, idProducto, cantidadProducto, cantidadRestante) 
                    values (${idCreado.data[0][0].idCreado},${productos.idProducto},${productos.cantProducto},${productos.cantidadRestante})`;
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
              del.then(() => {
                reject(
                  JSON.stringify({
                    code: 400,
                    data: "Error",
                    message: "Productos: " + addedProd.message,
                  })
                );
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
      ? `where estado>0`
      : `where estado=0`;
  var queryGetList = `select a.estado, b.nombre as nombreOrigen, a.idOrigen, a.idDestino,
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
    select a.estado, b.nombre as nombreOrigen, a.idOrigen, a.idDestino,
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
    select a.estado, 'Agencia movil '+b.placa as nombreOrigen, a.idOrigen, a.idDestino,
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
module.exports = {
  createTransfer,
  getTransferList,
  getTransferProducts,
  updateTransfer,
};
