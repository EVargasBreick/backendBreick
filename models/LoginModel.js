const dbConnection = require("../server");

function loginUser(params) {
  console.log("Usuario ingresado:", params);
  let loginQuery = `select a.idUsuario, a.nombre, a.apPaterno, a.apMaterno, a.cedula, a.correo, a.rol, a.idAlmacen, b.horaEntrada, b.horaSalida, b.turno, a.tipoUsuario from Usuarios a 
  inner join Horarios_Acceso b on a.idUsuario=b.idUsuario where usuario='${params.usuario}' and password='${params.password}'`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Body del login", params.date);
      const login = await dbConnection.executeQuery(loginQuery);
      console.log("Respuesta loginnnn", login.data[0].length);
      if (login.data[0][0]) {
        setTimeout(async () => {
          var updateQuery = `update Usuarios set fultimoa=${params.date} where idUsuario=${login.data[0][0].idUsuario}`;
          const updateAcces = await dbConnection.executeQuery(updateQuery);
          console.log("Updae access", updateAcces);
          if (updateAcces.success) {
            const logQuery = `insert into Log_Accesos (idUsuario, fechaAcceso) values (${login.data[0][0].idUsuario}, ${params.date})`;
            setTimeout(async () => {
              log = await dbConnection.executeQuery(logQuery);
              console.log("Guardar log", log);
              if (log.success) {
                console.log("Acceso guardado", updateAcces);
                resolve(JSON.stringify(login.data));
              }
            }, 100);
          }
        }, 200);
      } else {
        resolve(JSON.stringify(login.data));
      }
    }, 1000);
  });
}
module.exports = loginUser;
