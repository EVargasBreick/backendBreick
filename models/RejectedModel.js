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

module.exports = {
  logRejectedOrder,
  getRejected,
  revisedRejected,
};
