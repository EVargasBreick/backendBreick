const { client } = require("../postgressConn");
const dbConnection = require("../server");

function registerPack(body) {
  const packQuery = `insert into Packs (nombrePack,precioPack,descripcionPack,codigoBarras, idPackProd) 
    values ('${body.nombrePack}',${body.precioPack},'${body.descPack}','-',0)`;
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
            const productQuery = `insert into Productos_Pack (idPack, idProducto, cantProducto) 
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
      if (pack.success) {
        resolve(pack);
      } else {
        reject(pack);
      }
    }, 1000);
  });
}

function addIdToPack(params) {
  const addQuery = `update Packs set idPackProd=${params.idProducto} where idPack=${params.idPack}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const pack = await dbConnection.executeQuery(addQuery);
      if (pack.success) {
        resolve(pack);
      } else {
        reject(pack);
      }
    }, 1000);
  });
}

//ACA EMPIEZA LO DE POSTGRES

function registerPackPos(body) {
  const packQuery = `insert into Packs ("nombrePack","precioPack","descripcionPack","codigoBarras", "idPackProd") 
    values ('${body.nombrePack}',${body.precioPack},'${body.descPack}','-',0) returning "idPack"`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const pack = await client.query(packQuery);
        console.log("Pack creado", pack.rows);
        const idCreado = pack.rows[0].idPack;
        console.log("Body recibido", body);
        body.productos.map((pr) => {
          setTimeout(async () => {
            const productQuery = `insert into Productos_Pack ("idPack", "idProducto", "cantProducto") 
                values (${idCreado},${pr.idProducto},${pr.cantidadProducto})`;
            console.log("Product query", productQuery);
            try {
              const added = await client.query(productQuery);
              console.log("Added", added);
              resolve({ id: idCreado });
            } catch (err) {
              const deleteQuery = `delete from Packs where "idPack"=${idCreado}`;
              try {
                const deleted = await client.query(deleteQuery);
                reject(added);
              } catch {}
            }
          }, 100);
        });
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getPacksPos() {
  const packQuery = `select pc.*, pp.*, pr."nombreProducto", pr."precioDeFabrica" from Packs pc inner join Productos_Pack pp on pc."idPack"=pp."idPack" inner join Productos pr on pr."idProducto"=pp."idProducto"`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const pack = await client.query(packQuery);
        resolve(pack.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function addIdToPackPos(params) {
  const addQuery = `update Packs set "idPackProd"=${params.idProducto} where "idPack"=${params.idPack}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const pack = await client.query(addQuery);
        resolve(pack);
      } catch (err) {
        reject(err);
      }
    }, 1000);
  });
}

module.exports = {
  registerPack,
  getPacks,
  addIdToPack,
  registerPackPos,
  getPacksPos,
  addIdToPackPos,
};
