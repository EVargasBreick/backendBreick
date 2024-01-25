const { client } = require("../postgressConn");
const dbConnection = require("../server");

function logRejectedOrder(body) {
  const query = `insert into Log_Rechazos (motivo, idOrden, fechaRegistro, idUsuario, intId, tipo, revisado) 
    values ('${body.motivo}', '${body.idOrden}', '${body.fechaRegistro}', ${body.idUsuario}, ${body.intId}, '${body.tipo}',0)`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query de loggeo", query);
      const logged = await dbConnection.executeQuery(query);
      if (logged.success) {
        resolve(logged);
      } else {
        reject(logged);
      }
    }, 100);
  });
}

function getRejected() {
  const query = `select lr.*, us.usuario as usuarioRechazo from Log_Rechazos lr 
    inner join Usuarios us on lr.idUsuario=us.idUsuario where lr.revisado=0`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query de loggeo", query);
      const logged = await dbConnection.executeQuery(query);
      if (logged.success) {
        resolve(logged);
      } else {
        reject(logged);
      }
    }, 100);
  });
}

function revisedRejected(params) {
  const query = `update Log_Rechazos set revisado=1 where idLogRechazo=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query de loggeo", query);
      const logged = await dbConnection.executeQuery(query);
      if (logged.success) {
        resolve(logged);
      } else {
        reject(logged);
      }
    }, 100);
  });
}

//Postgres

function logRejectedOrderPos(body) {
  const query = `insert into Log_Rechazos (motivo, "idOrden", "fechaRegistro", "idUsuario", "intId", tipo, revisado) 
  values ('${body.motivo}', '${body.idOrden}', '${body.fechaRegistro}', ${body.idUsuario}, ${body.intId}, '${body.tipo}',0)`;
  const queryNew = `insert into traspaso_rechazado ("idTraspaso","idUsuario","fechaHora",revisado) values ($1,$2,$3,0) returning "idTraspasoRechazado"`;
  const params = [body.intId, body.idUsuario, body.fechaRegistro];
  const products = body.productos;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query de loggeo", query);
      try {
        await client.query("BEGIN");
        const logged = await client.query(query);
        const loggedNew = await client.query(queryNew, params);
        const idCreado = loggedNew.rows[0].idTraspasoRechazado;
        for (const product of products) {
          const queryProds = `insert into productos_traspaso_rechazado ("idTraspasoRechazado", "idTraspaso", "idProducto", "cantProducto") values ($1,$2,$3,$4)`;
          const paramProducts = [
            idCreado,
            body.intId,
            product.idProducto,
            product.cantProducto,
          ];
          const added = await client.query(queryProds, paramProducts);
          console.log("Added", added);
        }
        await client.query("COMMIT");
        resolve(logged.rows);
      } catch (err) {
        console.log("Error al loggear traspaso rechazado", err);
        await client.query("ROLLBACK");
        reject(err);
      }
    }, 100);
  });
}

function getRejectedPos() {
  const query = `select lr.*, us.usuario as "usuarioRechazo" from Log_Rechazos lr 
  inner join Usuarios us on lr."idUsuario"=us."idUsuario" where lr.revisado=0 order by cast("idLogRechazo" as int) desc`;
  const queryLogged = `select * from traspaso_rechazado tr 
  left join productos_traspaso_rechazado ptr on ptr."idTraspasoRechazado"=tr."idTraspasoRechazado"
  left join productos pr on pr."idProducto"=ptr."idProducto" 
  where revisado=0`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query de loggeo", query);
      try {
        const newLogged = await client.query(queryLogged);
        console.log("NEWLOGGED", newLogged.rows);
        const logged = await client.query(query);

        resolve({ logged: logged.rows, details: newLogged.rows });
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function revisedRejectedPos(params) {
  const query = `update Log_Rechazos set revisado=1 where "idLogRechazo"=${params.id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query de loggeo", query);
      try {
        const logged = await client.query(query);
        resolve(logged.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

async function getTransferDetail(params) {
  const query = `select * from traspasos where "idTraspaso"=$1`;
  try {
    const details = await client.query(query, [params.id]);
    return details.rows;
  } catch (error) {
    return new Promise.reject(error);
  }
}

module.exports = {
  logRejectedOrder,
  getRejected,
  revisedRejected,
  logRejectedOrderPos,
  getRejectedPos,
  revisedRejectedPos,
  getTransferDetail,
};
