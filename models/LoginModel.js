const dbConnection = require("../server");

function loginUser(params) {
  console.log("Usuario ingresado:", params);
  let loginQuery = `select idUsuario, nombre, cedula, correo, rol, idAlmacen from Usuarios where usuario='${params.usuario}' and password='${params.password}'`;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log(loginQuery);
      const login = await dbConnection.executeQuery(loginQuery);
      resolve(JSON.stringify(login.data));
    }, 1000);
  });
}
module.exports = loginUser;
