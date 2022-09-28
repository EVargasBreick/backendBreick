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
    idAlmacen) values 
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
      '${data.idAlmacen}'
    )`;
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      console.log(addUserQuery);
      const newUser = await dbConnection.executeQuery(addUserQuery);
      console.log(newUser);
      if (newUser.success) {
        responseObject.code = 201;
        responseObject.data = "Sucess";
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
      console.log("Query:", query);
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
module.exports = { findUserByName, findUserById, createNewUser, findUserBasic };
