const { client } = require("../postgressConn");
const dbConnection = require("../server");

function loginUser(params) {
  console.log("Usuario ingresado:", params);
  let loginQuery = `select a.idUsuario, a.nombre, a.apPaterno, a.apMaterno, a.cedula, a.correo, a.rol, a.idAlmacen, a.usuario, b.horaEntrada, b.horaSalida, b.turno, a.tipoUsuario from Usuarios a 
  inner join Horarios_Acceso b on a.idUsuario=b.idUsuario where usuario='${params.usuario}' and password='${params.password}'`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Body del login", params.date);
      const login = await dbConnection.executeQuery(loginQuery);
      console.log("Respuesta loginnnn", login.data);
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

function loginUserPos(params) {
  console.log("Usuario ingresado:", params);
  let loginQuery = `select a."idUsuario", a.nombre, a."apPaterno", a."apMaterno", a.cedula, a.correo, a.rol, a."idAlmacen", a.usuario, b."horaEntrada", b."horaSalida", b.turno, a."tipoUsuario", a."idDepto" from Usuarios a 
  inner join Horarios_Acceso b on a."idUsuario"=b."idUsuario" where usuario='${params.usuario}' and password='${params.password}'`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Body del login", params.date);
      try {
        const login = await client.query(loginQuery);
        console.log("Respuesta loginnnn", login.rows);
        if (login.rows.length > 0) {
          setTimeout(async () => {
            var updateQuery = `update Usuarios set fultimoa=${params.date} where "idUsuario"=${login.rows[0].idUsuario}`;
            try {
              const updateAcces = await client.query(updateQuery);
              const logQuery = `insert into Log_Accesos ("idUsuario", "fechaAcceso") values (${login.rows[0].idUsuario}, ${params.date})`;
              setTimeout(async () => {
                try {
                  log = await client.query(logQuery);
                  console.log("Acceso guardado", updateAcces);
                  resolve(JSON.stringify(login.rows));
                } catch {
                  console.log("error al guardar log de Logins");
                }
              }, 100);
            } catch {
              console.log("error al updatear usuario");
            }
          }, 200);
        } else {
          resolve(JSON.stringify(login.rows));
        }
      } catch (err) {
        console.log("error");
      }
    }, 100);
  });
}

module.exports = { loginUser, loginUserPos };
