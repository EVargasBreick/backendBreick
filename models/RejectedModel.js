const dbConnection = require("../server");

function logRejectedOrder(body) {
  const query = `insert into Log_Rechazos (motivo, idOrden, fechaRegistro, idUsuario, intId, tipo) 
    values ('${body.motivo}', '${body.idOrden}', '${body.fechaRegistro}', ${body.idUsuario}, ${body.intId}, '${body.tipo}')`;
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
  const query = `select lr.*, us.usuario from Log_Rechazos lr 
    inner join Usuarios us on lr.idUsuario=us.idUsuario`;
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
};
