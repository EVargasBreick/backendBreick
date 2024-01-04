const { client } = require("../postgressConn");
const dbConnection = require("../server");
const { transactionOfUpdateStocks } = require("./store_model");

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

function createDropPos(body) {
  console.log("Body recibido", body);
  const queryBaja = `insert into Bajas (motivo, "fechaBaja", "idUsuario", "idAlmacen", "totalbaja", "vale","estado",ci) 
    values ('${body.motivo}', '${body.fechaBaja}', ${body.idUsuario},'${body.idAlmacen}', ${body.totalbaja}, ${body.vale},1,${body.ci}) returning "idBaja"`;
  console.log("query baja", queryBaja);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const newDrop = await client.query(queryBaja);
        const idCreado = newDrop.rows[0].idBaja;
        console.log("Id Creado:", idCreado);
        body.productos.map((pr) => {
          const queryProd = `insert into Baja_Productos ("idBaja", "idProducto", "cantProducto", "subtotal") 
                     values (${idCreado},${pr.idProducto}, ${pr.cantProducto}, ${pr.total})`;
          setTimeout(async () => {
            try {
              const added = await client.query(queryProd);
              console.log("Todo bien al agregar productos", idCreado);
              resolve({ added: added.rows, id: idCreado });
            } catch {
              const del = client.query(
                `delete from Bajas where "idBaja"=${idCreado}`
              );
              reject(del);
              console.log("Error al guardar la baja del producto");
            }
          }, 100);
        });
      } catch (err) {
        console.log("error al crear la baja", err);
        reject("Error al crear la baja");
      }
    }, 100);
  });
}

async function cancelDrop(dropId, userId, products) {
  try {
    const canceledQuery = `update bajas set estado=0, usuariocancel=$1 where "idBaja"=$2`;
    console.log("Cancel query", canceledQuery);
    console.log("Productos", products);
    await client.query("BEGIN");
    const canceled = client.query(canceledQuery, [userId, dropId]);
    const stockReturned = await transactionOfUpdateStocks([products], true);
    await client.query("COMMIT");
    return { canceled, stockReturned };
  } catch (err) {
    await client.query("ROLLBACK");
    return err;
  }
}

async function getDropInfo(dropId) {
  try {
    const dropQuery = `select bj.*, bp.*, pr."codInterno",pr."nombreProducto", (select "razonSocial" 
    from clientes where "nit"=(select ci from bajas where "idBaja"=$1 )limit 1)as "razonSocial" from bajas bj 
      inner join baja_productos bp on bp."idBaja"=bj."idBaja"
      inner join productos pr on pr."idProducto"=bp."idProducto" 
  where bj."idBaja"=$1
  
  `;
    const dropInfo = await client.query(dropQuery, [dropId]);
    return dropInfo.rows;
  } catch (err) {
    return err;
  }
}

module.exports = { createDrop, createDropPos, cancelDrop, getDropInfo };
