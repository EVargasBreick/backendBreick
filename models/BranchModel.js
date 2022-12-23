const dbConnection = require("../server");

function getBranches() {
  let dpQuery = `select a.idImpuestos, a.leyenda, c.ciudad , b.* from Sucursales a inner join Agencias b on a.idString=b.idAgencia inner join Zonas c on b.idZona=c.idZona union
  select a.idImpuestos, a.leyenda, c.ciudad , b.* from Sucursales a inner join Bodegas b on a.idString=b.idBodega inner join Zonas c on b.idZona=c.idZona
      `;

  return new Promise((resolve) => {
    setTimeout(async () => {
      const dpto = await dbConnection.executeQuery(dpQuery);
      resolve(JSON.stringify(dpto.data));
    }, 1000);
  });
}
module.exports = getBranches;
