const { client } = require("../postgressConn");
const dbConnection = require("../server");

function findUserByName(nombre) {
  var queryAll = `select * from Usuarios where nombre='${nombre}'`;
  var queryFind = "select * from Usuarios";

  var query = nombre === undefined ? queryFind : queryAll;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query:", query);
      const clients = await dbConnection.executeQuery(query);
      console.log("Respuestita", clients.data);
      if (JSON.stringify(clients.data).length < 5) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.data),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}
function findUserById(id) {
  var queryAll = `select * from Usuarios where idUsuario='${id}'`;
  var queryFind = "select * from Usuarios";
  var query = id === undefined ? queryFind : queryAll;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query:", query);
      const clients = await dbConnection.executeQuery(query);
      console.log("Respuestita", clients.data);
      if (JSON.stringify(clients.data).length < 5) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.data),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}
function createNewUser(data) {
  console.log("Body:", data);
  var addUserQuery = `insert into Usuarios (
    nombre, 
    apPaterno, 
    apMaterno,
    cedula,
    correo,
    acceso,
    rol,
    usuario,
    password,
    fultimoa,
    fcreacion,
    factualizacion,
    usuarioCrea,
    idioma,
    idAlmacen, idDepto, tipoUsuario) values 
    (
      '${data.nombre}',
      '${data.apPaterno}',
      '${data.apMaterno}',
      '${data.cedula}',
      '${data.correo}',
      ${data.acceso},
      ${data.rol},
      '${data.usuario}',
      '${data.password}',
      '${data.fultimoa}',
      '${data.fcreacion}',
      '${data.factualizacion}',
      ${data.usuariocrea},
      ${data.idioma},
      '${data.idAlmacen}',
      ${data.idDepto},
      ${data.tipoUsuario}
    )`;
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      console.log(addUserQuery);
      const newUser = await dbConnection.executeQuery(addUserQuery);
      console.log(newUser);
      if (newUser.success) {
        const idCreado = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Usuarios') as 'idCreado'`
        );
        console.log("Id Creado:", idCreado.data[0][0].idCreado);
        const horarioQuery = `insert into Horarios_acceso (idUsuario, horaEntrada, horaSalida, turno) values (${idCreado.data[0][0].idCreado},'09:00', '22:00', 'completo')`;
        const workTime = await dbConnection.executeQuery(horarioQuery);
        if (workTime.success) {
          responseObject.code = 201;
          responseObject.data = "Sucess";
        } else {
          const queryDelete = `delete from Usuarios where idUsuario=${idCreado.data[0][0].idCreado}`;
          const deleted = await dbConnection.executeQuery(queryDelete);
          if (deleted.success) {
            responseObject.code = 400;
            responseObject.data = "Error";
            responseObject.message = workTime.message;
            console.log("Error en la data", workTime.message);
          }
        }
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = newUser.message;
        console.log("Error en la data", newUser.message);
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}
function findUserBasic() {
  var queryFind =
    "select idUsuario, nombre + ' ' + apPaterno + ' ' + apMaterno as nombre from Usuarios ORDER by nombre";
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const clients = await dbConnection.executeQuery(queryFind);
      console.log("Respuestita", clients.data);
      if (JSON.stringify(clients.data).length < 5) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.data),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

//POSTGRES

function findUserByNamePos(nombre) {
  var queryAll = `select * from Usuarios where nombre='${nombre}'`;
  var queryFind = "select * from Usuarios";

  var query = nombre === undefined ? queryFind : queryAll;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query:", query);
      const clients = await client.query(query);
      console.log("Respuestita", clients.rows);
      if (JSON.stringify(clients.rows).length < 1) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.rows),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 100);
  });
}

function findUserByIdPos(id) {
  var queryAll = `select * from Usuarios where "idUsuario"='${id}'`;
  var queryFind = "select * from Usuarios";
  var query = id === undefined ? queryFind : queryAll;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query:", query);
      const clients = await client.query(query);
      console.log("Respuestita", clients.rows);
      if (JSON.stringify(clients.rows).length < 1) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.rows),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 100);
  });
}

function createNewUserPos(data) {
  console.log("Body:", data);
  var addUserQuery = `insert into Usuarios (
    nombre, 
    "apPaterno", 
    "apMaterno",
    cedula,
    correo,
    acceso,
    rol,
    usuario,
    password,
    fultimoa,
    fcreacion,
    factualizacion,
    "usuarioCrea",
    idioma,
    "idAlmacen", "idDepto", "tipoUsuario") values 
    (
      '${data.nombre}',
      '${data.apPaterno}',
      '${data.apMaterno}',
      '${data.cedula}',
      '${data.correo}',
      ${data.acceso},
      ${data.rol},
      '${data.usuario}',
      '${data.password}',
      '${data.fultimoa}',
      '${data.fcreacion}',
      '${data.factualizacion}',
      ${data.usuariocrea},
      ${data.idioma},
      '${data.idAlmacen}',
      ${data.idDepto},
      ${data.tipoUsuario}
    ) returning "idUsuario"`;
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      console.log(addUserQuery);
      try {
        const newUser = await client.query(addUserQuery);
        const idCreado = newUser.rows[0].idUsuario;
        const horarioQuery = `insert into Horarios_acceso ("idUsuario", "horaEntrada", "horaSalida", turno) values (${idCreado},'09:00', '22:00', 'completo')`;
        try {
          const workTime = await client.query(horarioQuery);
          responseObject.code = 201;
          responseObject.data = "Sucess";
        } catch (err) {
          const queryDelete = `delete from Usuarios where idUsuario=${idCreado}`;
          const deleted = await dbConnection.executeQuery(queryDelete);
          if (deleted.success) {
            responseObject.code = 400;
            responseObject.data = "Error";
            responseObject.message = err;
          }
        }
      } catch (err) {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 100);
  });
}

function findUserBasicPos() {
  var queryFind = `select "idUsuario", nombre || ' ' || "apPaterno" || ' ' || "apMaterno" as nombre from Usuarios ORDER by nombre`;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const clients = await client.query(queryFind);
      if (JSON.stringify(clients.rows).length < 1) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.rows),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

async function changePassword(data) {
  const { idUser, originalPassword, newPassword } = data;
  const checkPassword = `select password from Usuarios where "idUsuario"=${idUser}`;
  const queryChange = `update Usuarios set password='${newPassword}' where "idUsuario"=${idUser}`;
  try {
    const isPasswordCorrect = await client.query(checkPassword);
    if (isPasswordCorrect.rows[0].password === originalPassword) {
      const data = await client.query(queryChange);
      return "Contraseña actualizada";
    }
    throw "Contraseña Actual incorrecta";

  } catch (err) {
    throw err;
  }

}

module.exports = {
  findUserByName,
  findUserById,
  createNewUser,
  findUserBasic,
  findUserByNamePos,
  findUserByIdPos,
  createNewUserPos,
  findUserBasicPos,
  changePassword
};
