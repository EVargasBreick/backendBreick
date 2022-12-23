const dbConnection = require("../server");

function GeneralSalesReport(params) {
  const generalQuery = `select SUBSTRING(fc.fechaHora, 0,11) as fecha,
        SUBSTRING(fc.fechaHora, 12,5) as hora,
        fc.nroFactura, 
        fc.cuf, 
        fc.nitCliente, 
        fc.razonSocial,
        fc.estado,  
        vn.montoTotal, 
        vn.descuentoCalculado, 
        vn.montoFacturar, 
        fc.importeBase, 
        fc.debitoFiscal,
        fc.desembolsada,
        us.nombre+' '+us.apPaterno+' '+us.apMaterno as 'nombreCompleto',
        (select nombre from Agencias where idAgencia=us.idAlmacen union 
        select nombre from Bodegas where idBodega=us.idAlmacen union 
        select placa from Vehiculos where placa=us.idAlmacen) as Agencia
    from Facturas fc inner join ventas vn on vn.idFactura=fc.idFactura
    inner join Usuarios us on vn.idUsuarioCrea=us.idUsuario
    where SUBSTRING(fc.fechaHora, 0,11) BETWEEN '${params.idate}' and '${params.fdate}'
    order by ${params.sort}
    `;
  console.log("Query fechas:", generalQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const data = await dbConnection.executeQuery(generalQuery);
      if (data.success) {
        resolve(data);
      } else {
        reject(data);
      }
    }, 200);
  });
}

module.exports = { GeneralSalesReport };
