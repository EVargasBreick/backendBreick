const dbConnection = require("../server");

function registerPack(body) {
  const packQuery = `insert into Packs (nombrePack,precioPack,descripcionPack,codigoBarras) 
    values ('${body.nombrePack}',${body.precioPack},'${body.descPack}','-')`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const pack = await dbConnection.executeQuery(packQuery);
      if (pack.success) {
        const idCreadoRes = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Packs') as 'idCreado'`
        );
        const idCreado = idCreadoRes.data[0][0].idCreado;
        body.productos.map((pr) => {
          setTimeout(async () => {
            const productQuery = `insert into Productos_Pack (idPack, idProducto, cant_Producto) 
                values (${idCreado},${pr.idProducto},${pr.cantidadProducto})`;
            const added = await dbConnection.executeQuery(productQuery);
            if (!added.success) {
              const deleteQuery = `delete from Packs where idPack=${idCreado}`;
              const deleted = await dbConnection.executeQuery(deleteQuery);
              if (deleted.success) {
                reject(added);
              }
            } else {
              resolve({ id: idCreado });
            }
          }, 100);
        });
      } else {
        reject(pack);
      }
    }, 100);
  });
}

function getPacks() {
  const packQuery = `select pc.*, pp.*, pr.nombreProducto, pr.precioDeFabrica from Packs pc inner join Productos_Pack pp on pc.idPack=pp.idPack inner join Productos pr on pr.idProducto=pp.idProducto`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const pack = await dbConnection.executeQuery(packQuery);
      console.log("Pack", pack.data);
      if (pack.success) {
        resolve(pack);
      } else {
        reject(pack);
      }
    }, 1000);
  });
}

module.exports = { registerPack, getPacks };
