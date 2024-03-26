const { client } = require("../postgressConn");
const dbConnection = require("../server");

function getRoles() {
  let rolQuery = "select * from Categorias";

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const roles = await dbConnection.executeQuery(rolQuery);
      resolve(JSON.stringify(roles.data));
      console.log("Almacenes", JSON.stringify(roles.data));
    }, 1000);
  });
}

function getRolesPos() {
  let rolQuery = "select * from Categorias";
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const roles = await client.query(rolQuery);
        resolve(JSON.stringify(roles.rows));
        console.log("Almacenes", JSON.stringify(roles.rows));
      } catch {
        reject(error);
      }
    }, 100);
  });
}

module.exports = { getRoles, getRolesPos };
