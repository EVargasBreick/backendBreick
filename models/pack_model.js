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
              } catch { }
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
  const packQuery = `select pc.*, pp.*, pr."nombreProducto", pr."precioDeFabrica", pc."precioPack" from Packs pc inner join Productos_Pack pp on pc."idPack"=pp."idPack" inner join Productos pr on pr."idProducto"=pp."idProducto"`;
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

async function updatePack(products, total) {
  try {
    await client.query('BEGIN');
    const { nombrePack, idPack, idPackProd } = products[0];

    const list_of_ids_original = await client.query('SELECT "idProductoPack" FROM productos_pack WHERE "idPack" = $1', [idPack]);
    const list_of_ids = products.map((product) => product.idProductoPack);
    const idsToDelete = list_of_ids_original.rows.filter((product) => !list_of_ids.includes(product.idProductoPack)).map((product) => product.idProductoPack);
    const idsToCreate = products
      .filter((product) => !product.idProductoPack)
      .map((product) => product.idProducto);
    const productsToUpdate = products.filter((product) => product.idProductoPack);

    await client.query(
      'UPDATE packs SET "precioPack" = $1 WHERE "nombrePack" = $2',
      [total, nombrePack]
    );

    await client.query(
      'UPDATE productos SET "precioDeFabrica" = $1, "precioPDV" = $1 , "precioDescuentoFijo" = $1  WHERE "idProducto" = $2',
      [Number(total), Number(idPackProd)]
    );

    for (const product of productsToUpdate) {
      const { cantProducto, idProductoPack } = product;
      await client.query(
        'UPDATE productos_pack SET "cantProducto" = $1 WHERE "idProductoPack" = $2',
        [Number(cantProducto), Number(idProductoPack)]
      );
    }

    if (idsToCreate.length > 0) {
      for (const idToCreate of idsToCreate) {
        const productoAct = products.find((product) => product.idProducto === idToCreate)
        const newProductData = {
          idPack,
          idProducto: idToCreate,
          cantProducto: Number(productoAct.cantProducto || productoAct.cantidadProducto),
        };

        await client.query(
          'INSERT INTO productos_pack ("idPack", "idProducto", "cantProducto") VALUES ($1, $2, $3)',
          [newProductData.idPack, newProductData.idProducto, newProductData.cantProducto]
        );
      }
    }

    if (idsToDelete) {
      for (const idToDelete of idsToDelete) {
        await client.query(
          'DELETE FROM productos_pack WHERE "idProductoPack" = $1 and "idPack" = $2',
          [Number(idToDelete), Number(idPack)]
        );
      }

    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    throw error;
  }
}

module.exports = {
  registerPack,
  getPacks,
  addIdToPack,
  registerPackPos,
  getPacksPos,
  addIdToPackPos,
  updatePack
};
