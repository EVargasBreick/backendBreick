const dbConnection = require("../server");
const { client } = require("../postgressConn");
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

function getBranchesPostgres() {
  let dpQuery = `select a."idImpuestos", a.leyenda, c.ciudad , b.* from Sucursales a inner join Agencias b on a."idString"=b."idAgencia" inner join Zonas c on b."idZona"=c."idZona" union
  select a."idImpuestos", a.leyenda, c.ciudad , b.* from Sucursales a inner join Bodegas b on a."idString"=b."idBodega" inner join Zonas c on b."idZona"=c."idZona"`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const result = await client.query(dpQuery);
      resolve(JSON.stringify(result.rows));
    }, 100);
  });
}

module.exports = { getBranches, getBranchesPostgres };
