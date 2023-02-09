const dbConnection = require("../server");

function createDrop(body) {
  const queryBaja = `insert into Bajas (motivo, fechaBaja, idUsuario, idAlmacen) 
    values ('${body.motivo}', '${body.fechaBaja}', ${body.idUsuario},'${body.idAlmacen}')`;
  console.log("query baja", queryBaja);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const newDrop = await dbConnection.executeQuery(queryBaja);
      if (newDrop.success) {
        const idCreadoData = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Bajas') as 'idCreado'`
        );
        const idCreado = idCreadoData.data[0][0].idCreado;
        console.log("Id Creado:", idCreado);
        body.productos.map((pr) => {
          const queryProd = `insert into Baja_Productos (idBaja, idProducto, cantProducto) 
                     values (${idCreado},${pr.idProducto}, ${pr.cantProducto})`;
          setTimeout(async () => {
            const added = await dbConnection.executeQuery(queryProd);
            if (added.success) {
              console.log("Todo bien al agregar productos", idCreado);
              resolve({ added, id: idCreado });
            } else {
              const del = dbConnection.executeQuery(
                `delete from Bajas where idBaja=${idCreado}`
              );
              reject(del);
              console.log("Error al guardar la baja del producto");
            }
          }, 100);
        });
      } else {
        console.log("error al crear la baja", newDrop);
        reject("Error al crear la baja");
      }
    }, 100);
  });
}

module.exports = { createDrop };
