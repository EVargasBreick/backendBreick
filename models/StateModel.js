const dbConnection = require("../server");

function getDepartamentos() {
  let dpQuery = "select * from Departamentos";

  return new Promise((resolve) => {
    setTimeout(async () => {
      const dpto = await dbConnection.executeQuery(dpQuery);
      resolve(JSON.stringify(dpto.data));
    }, 1000);
  });
}
module.exports = getDepartamentos;
