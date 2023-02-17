const { client } = require("../postgressConn");
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

function getDepartamentosPos() {
  let dpQuery = "select * from Departamentos";
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const dpto = await client.query(dpQuery);
        resolve(JSON.stringify(dpto.rows));
      } catch {
        console.log("Problema al cargar los deptos");
      }
    }, 1000);
  });
}

module.exports = { getDepartamentos, getDepartamentosPos };
