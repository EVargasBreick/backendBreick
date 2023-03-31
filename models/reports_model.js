const { client } = require("../postgressConn");
const dbConnection = require("../server");

function GeneralSalesReport(params) {
  const fromDateParts = params.idate.split("/");
  const fromDate = `${fromDateParts[2]}-${fromDateParts[1]}-${fromDateParts[0]}`;
  const toDateParts = params.fdate.split("/");
  const toDate = `${toDateParts[2]}-${toDateParts[1]}-${toDateParts[0]}`;
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
    where convert(date, SUBSTRING(fc.fechaHora,7,4)+'-'+SUBSTRING(fc.fechaHora,4,2)+'-'+SUBSTRING(fc.fechaHora,1,2))
    BETWEEN convert(date,'${fromDate}') and convert(date,'${toDate}')
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

function ProductsSalesReport(params) {
  const fromDateParts = params.idate.split("/");
  const fromDate = `${fromDateParts[2]}-${fromDateParts[1]}-${fromDateParts[0]}`;
  const toDateParts = params.fdate.split("/");
  const toDate = `${toDateParts[2]}-${toDateParts[1]}-${toDateParts[0]}`;

  const generalQuery = `select fc.nroFactura, 
    SUBSTRING(fc.fechaHora, 0,11) as fecha,
    SUBSTRING(fc.fechaHora, 12,5) as hora,
    zn.zona,
    fc.nitCliente,
    fc.razonSocial,
    vn.montoFacturar,
    fc.debitoFiscal,
    pr.nombreProducto,
    pr.codInterno,
    vp.cantidadProducto,
    pr.precioDeFabrica,
    vp.totalProd,
    vp.descuentoProducto,
    us.nombre+' '+us.apPaterno+' '+us.apMaterno as 'nombreCompleto',
    (select nombre from Agencias where idAgencia=us.idAlmacen union 
    select nombre from Bodegas where idBodega=us.idAlmacen union 
    select placa from Vehiculos where placa=us.idAlmacen) as Agencia
from Facturas fc inner join Ventas vn on fc.idFactura=vn.idFactura
inner join Venta_Productos vp on vn.idVenta=vp.idVenta
inner join Productos pr on pr.idProducto=vp.idProducto
inner join Clientes cl on cl.idCliente=vn.idCliente
inner join Zonas zn on zn.idZona=cl.idZona
inner join Usuarios us on vn.idUsuarioCrea=us.idUsuario
      where convert(date, SUBSTRING(fc.fechaHora,7,4)+'-'+SUBSTRING(fc.fechaHora,4,2)+'-'+SUBSTRING(fc.fechaHora,1,2))
      BETWEEN convert(date,'${fromDate}') and convert(date,'${toDate}')
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

function ClosingReport(params) {
  const generalQuery = `select  fc.idSucursal, fc.puntoDeVenta, fc.idOtroPago, fc.tipoPago, sum(fc.pagado) as totalPagado, sum(fc.cambio) as totalCambio, sum(fc.vale) as totalVale
 from Facturas fc inner join Sucursales sc on fc.idSucursal=sc.idImpuestos
 where fc.idSucursal=${params.idSucursal} and fc.puntoDeVenta=${params.idPdv} and convert(date, SUBSTRING(fc.fechaHora,7,4)+'-'+SUBSTRING(fc.fechaHora,4,2)+'-'+SUBSTRING(fc.fechaHora,1,2))=CAST( GETDATE() AS Date )
 group by fc.idSucursal, fc.puntoDeVenta, fc.idOTroPago, fc.tipoPago `;
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

function FirstAndLast(params) {
  const query = `select  min(cast(fc.nroFactura as int)) as PrimeraFactura, max(cast(fc.nroFactura as int)) as UltimaFactura, count(fc.nroFactura) as CantidadFacturas from Facturas fc 
  where fc.idSucursal=${params.idSucursal} and fc.puntoDeVenta=${params.idPdv} 
  and convert(date, SUBSTRING(fc.fechaHora,7,4)+'-'+SUBSTRING(fc.fechaHora,4,2)+'-'+SUBSTRING(fc.fechaHora,1,2))=CAST( GETDATE() AS Date )
  `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const data = await dbConnection.executeQuery(query);
      if (data.success) {
        resolve(data);
      } else {
        reject(data);
      }
    }, 200);
  });
}

//POSTGRES

function GeneralSalesReportPos(params) {
  const fromDateParts = params.idate.split("/");
  const fromDate = `${fromDateParts[2]}-${fromDateParts[1]}-${fromDateParts[0]}`;
  const toDateParts = params.fdate.split("/");
  const toDate = `${toDateParts[2]}-${toDateParts[1]}-${toDateParts[0]}`;
  const isSudo =
    params.idAgencia != "" ? `and fc."idAgencia"='${params.idAgencia}'` : "";
  const generalQuery = `select SUBSTRING(fc."fechaHora", 0,11) as "fecha",
        SUBSTRING(fc."fechaHora", 12,5) as "hora",
        fc."nroFactura", 
        fc.cuf, 
        fc."nitCliente", 
        fc."razonSocial",
        fc.estado,  
        vn."montoTotal", 
        vn."descuentoCalculado", 
        vn."montoFacturar", 
        fc."importeBase", 
        fc."debitoFiscal",
        fc.desembolsada,
        fc.vale,
        us.nombre||' '||us."apPaterno"||' '||us."apMaterno" as "nombreCompleto",
        (select nombre from Agencias where "idAgencia"=us."idAlmacen" union 
        select nombre from Bodegas where "idBodega"=us."idAlmacen" union 
        select placa from Vehiculos where placa=us."idAlmacen") as "Agencia"
    from Facturas fc inner join ventas vn on vn."idFactura"=fc."idFactura"
    inner join Usuarios us on vn."idUsuarioCrea"=us."idUsuario"
    where TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')
    BETWEEN TO_DATE('${params.idate}','DD/MM/YYYY') and TO_DATE('${params.fdate}','DD/MM/YYYY')
    ${isSudo}
    order by ${params.sort}
    `;
  console.log("Query fechas:", generalQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const data = await client.query(generalQuery);
        resolve(data.rows);
      } catch (err) {
        reject(err);
      }
    }, 200);
  });
}

function ProductsSalesReportPos(params) {
  const fromDateParts = params.idate.split("/");
  const fromDate = `${fromDateParts[2]}-${fromDateParts[1]}-${fromDateParts[0]}`;
  const toDateParts = params.fdate.split("/");
  const toDate = `${toDateParts[2]}-${toDateParts[1]}-${toDateParts[0]}`;
  const isSudo =
    params.idAgencia != "" ? `and fc."idAgencia"='${params.idAgencia}'` : "";
  const generalQuery = `select fc."nroFactura", 
    SUBSTRING(fc."fechaHora", 0,11) as "fecha",
    SUBSTRING(fc."fechaHora", 12,5) as "hora",
    zn.zona,
    fc."nitCliente",
    fc."razonSocial",
    vn."montoFacturar",
    fc."debitoFiscal",
    pr."nombreProducto",
    pr."codInterno",
    vp."cantidadProducto",
    pr."precioDeFabrica",
    vp."totalProd",
    vp."descuentoProducto",
    fc.vale,
    us.nombre||' '||us."apPaterno"||' '||us."apMaterno" as "nombreCompleto",
    (select nombre from Agencias where "idAgencia"=us."idAlmacen" union 
    select nombre from Bodegas where "idBodega"=us."idAlmacen" union 
    select placa from Vehiculos where placa=us."idAlmacen") as "Agencia"
from Facturas fc inner join Ventas vn on fc."idFactura"=vn."idFactura"
inner join Venta_Productos vp on vn."idVenta"=vp."idVenta"
inner join Productos pr on pr."idProducto"=vp."idProducto"
inner join Clientes cl on cl."idCliente"=vn."idCliente"
inner join Zonas zn on zn."idZona"=cl."idZona"
inner join Usuarios us on vn."idUsuarioCrea"=us."idUsuario"
where TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')
BETWEEN TO_DATE('${params.idate}','DD/MM/YYYY') and TO_DATE('${params.fdate}','DD/MM/YYYY')
${isSudo}
      order by ${params.sort}
      `;
  console.log("Query fechas:", generalQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const data = await client.query(generalQuery);
        resolve(data.rows);
      } catch (err) {
        reject(err);
      }
    }, 200);
  });
}

function ClosingReportPos(params) {
  console.log("Es ruta", params.ruta);
  const generalQuery = params.ruta
    ? `select  fc."idSucursal", fc."puntoDeVenta", fc."idOtroPago", fc."tipoPago", sum(fc.pagado) as "totalPagado", sum(fc.cambio) as "totalCambio", sum(fc.vale) as "totalVale"
 from Facturas fc inner join Sucursales sc on fc."idSucursal"=sc."idImpuestos"
 where fc."idSucursal"=${params.idSucursal} and fc."puntoDeVenta"=${params.idPdv} and TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')=CAST(CURRENT_DATE AS Date ) and fc."idAgencia"=${params.idAgencia}
 group by fc."idSucursal", "puntoDeVenta", fc."idOtroPago", fc."tipoPago" `
    : `select  fc."idSucursal", fc."puntoDeVenta", fc."idOtroPago", fc."tipoPago", sum(fc.pagado) as "totalPagado", sum(fc.cambio) as "totalCambio", sum(fc.vale) as "totalVale"
 from Facturas fc inner join Sucursales sc on fc."idSucursal"=sc."idImpuestos"
 where fc."idSucursal"=${params.idSucursal} and fc."puntoDeVenta"=${params.idPdv} and TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')=CAST(CURRENT_DATE AS Date )
 group by fc."idSucursal", "puntoDeVenta", fc."idOtroPago", fc."tipoPago" `;
  console.log("Query fechas:", generalQuery);
  return new Promise((resolve, reject) => {
    console.log("Eod query", generalQuery);
    setTimeout(async () => {
      try {
        const data = await client.query(generalQuery);
        resolve(data.rows);
      } catch (err) {
        reject(err);
      }
    }, 200);
  });
}

function FirstAndLastPos(params) {
  const query = params.ruta
    ? `select  min(cast(fc."nroFactura" as int)) as "PrimeraFactura", max(cast(fc."nroFactura" as int)) as "UltimaFactura", count(fc."nroFactura") as "CantidadFacturas" from Facturas fc 
  where fc."idSucursal"=${params.idSucursal} and fc."puntoDeVenta"=${params.idPdv} and sc."idAgencia"=${params.idAgencia}
  and TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')=CAST(CURRENT_DATE AS Date)
  `
    : `select  min(cast(fc."nroFactura" as int)) as "PrimeraFactura", max(cast(fc."nroFactura" as int)) as "UltimaFactura", count(fc."nroFactura") as "CantidadFacturas" from Facturas fc 
  where fc."idSucursal"=${params.idSucursal} and fc."puntoDeVenta"=${params.idPdv} 
  and TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')=CAST(CURRENT_DATE AS Date)
  `;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const data = await client.query(query);
        resolve(data.rows);
      } catch (err) {
        reject(err);
      }
    }, 200);
  });
}

function mainPageReportPos() {
  const query = `select count(pd.facturado) as "pedidosFacturados", 
  (select count(*) from Pedidos where facturado=0 and estado='1') as "pedidosPorFacturar", 
  (select count(*) from Facturas where estado=1) as "facturasAnuladas",
  (select count(*) from Pedidos where tipo='muestra' and estado='1') as "muestrasAprobadas"
  from Pedidos pd where pd.facturado=1 and pd.estado='1'`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const data = await client.query(query);
        resolve(data.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

module.exports = {
  GeneralSalesReport,
  ProductsSalesReport,
  ClosingReport,
  FirstAndLast,
  GeneralSalesReportPos,
  ProductsSalesReportPos,
  ClosingReportPos,
  FirstAndLastPos,
  mainPageReportPos,
};
