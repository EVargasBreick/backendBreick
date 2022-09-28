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
module.exports = getRoles;
