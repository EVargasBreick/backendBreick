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
        (select nombre from Agencias where "idAgencia"=fc."idAgencia" union 
        select nombre from Bodegas where "idBodega"=fc."idAgencia" union 
        select placa from Vehiculos where placa=fc."idAgencia") as "Agencia"
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
    (select nombre from Agencias where "idAgencia"=fc."idAgencia" union 
    select nombre from Bodegas where "idBodega"=fc."idAgencia" union 
    select placa from Vehiculos where placa=fc."idAgencia") as "Agencia"
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
    ? `select  fc."idSucursal", fc."puntoDeVenta", fc."idOtroPago", fc."tipoPago", sum(fc.pagado) as "totalPagado", sum(fc.cambio) as "totalCambio", sum(fc.vale) as "totalVale", sum(fc.voucher) as "totalVoucher"
 from Facturas fc inner join Sucursales sc on fc."idSucursal"=sc."idImpuestos"
 where fc."idSucursal"=${params.idSucursal} and fc."puntoDeVenta"=${params.idPdv} and TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')=CAST(${params.fecha} AS Date )
 and fc."idAgencia"=${params.idAgencia} and fc.estado!=1 and fc."nroFactura"!='0'
 group by fc."idSucursal", "puntoDeVenta", fc."idOtroPago", fc."tipoPago" `
    : `select  fc."idSucursal", fc."puntoDeVenta", fc."idOtroPago", fc."tipoPago", sum(fc.pagado) as "totalPagado", sum(fc.cambio) as "totalCambio", sum(fc.vale) as "totalVale", sum(fc.voucher) as "totalVoucher"
 from Facturas fc inner join Sucursales sc on fc."idSucursal"=sc."idImpuestos"
 where fc."idSucursal"=${params.idSucursal} and fc.estado!=1 and fc."nroFactura"!='0'and fc."puntoDeVenta"=${params.idPdv} and TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')=CAST(${params.fecha} AS Date )
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
  and TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')=CAST(${params.fecha} AS Date )
  `
    : `select  min(cast(fc."nroFactura" as int)) as "PrimeraFactura", max(cast(fc."nroFactura" as int)) as "UltimaFactura", count(fc."nroFactura") as "CantidadFacturas" from Facturas fc 
  where fc."idSucursal"=${params.idSucursal} and fc."puntoDeVenta"=${params.idPdv} 
  and TO_DATE(SUBSTRING(fc."fechaHora",1,10),'DD/MM/YYYY')=CAST(${params.fecha} AS Date )
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

async function GeneralMarkdownsReport(
  idAgencia,
  startDate = null,
  endDate = null,
  idBaja = null
) {
  let query = `SELECT p."codInterno", p."nombreProducto", bp."cantProducto", b.*
    FROM baja_productos bp
    JOIN bajas b ON b."idBaja" = bp."idBaja"
    JOIN productos p ON bp."idProducto" = p."idProducto"
    WHERE b."idAlmacen" = $1
    `;
  const params = [idAgencia];

  if (startDate && endDate) {
    query += `AND TO_TIMESTAMP(b."fechaBaja", 'DD/MM/YYYY HH24:MI:SS')::date >= TO_DATE($2, 'YYYY-MM-DD')
    AND TO_TIMESTAMP(b."fechaBaja", 'DD/MM/YYYY HH24:MI:SS')::date <=  TO_DATE($3, 'YYYY-MM-DD')
    `;
    params.push(startDate, endDate);
  }

  if (idBaja) {
    query += `AND b."idBaja" = ${idBaja} `;
  }

  query += `ORDER BY b."fechaBaja" DESC;`;

  try {
    console.log(query);
    const data = await client.query(query, [...params]);
    return data.rows;
  } catch (err) {
    throw err;
  }
}

async function GroupedProductsOrderReport(
  idAgencia,
  startDate = null,
  endDate = null,
  estado = null,
  usuario = null,
  tipo = null,
  facturado = null,
  notas = null
) {
  let query = `select pp."idProducto", pr."codInterno", "nombreProducto", sum("cantidadProducto") as "sumaTotal" from Pedidos pd 
  inner join Pedido_Producto pp on pp."idPedido"=pd."idPedido"
  inner join Usuarios us on us."idUsuario"=pd."idUsuarioCrea"
  inner join Productos pr on pr."idProducto"=pp."idProducto"
  where us."idAlmacen" = $1 `;
  const params = [idAgencia];
  if (startDate && endDate) {
    console.log("Flag 1");
    query += `AND TO_TIMESTAMP(pd."fechaCrea", 'DD/MM/YYYY HH24:MI:SS')::date >= TO_DATE($2, 'YYYY-MM-DD')
    AND TO_TIMESTAMP(pd."fechaCrea", 'DD/MM/YYYY HH24:MI:SS')::date <=  TO_DATE($3, 'YYYY-MM-DD')
    `;
    params.push(startDate, endDate);
  }
  if (estado) {
    query += ` and estado= '${estado}' `;
  }
  if (usuario) {
    query += ` and usuario= '${usuario}' `;
  }

  if (tipo) {
    query += ` and tipo= '${tipo}' `;
  }

  if (facturado) {
    query += ` and facturado= ${facturado} `;
  }

  if (notas) {
    query += `and unaccent(pd.notas) ILIKE ALL (SELECT '%' || unaccent(value) || '%'
    FROM regexp_split_to_table('${notas}', '\\s+') AS value)`;
  }

  query += `group by pp."idProducto", "nombreProducto", "codInterno"
  order by cast(pp."idProducto" as int)`;

  try {
    console.log(query);
    const data = await client.query(query, [...params]);
    return data.rows;
  } catch (err) {
    console.log("Error", err);
    throw err;
  }
}

async function GroupedProductsTransferReport(
  idAgencia,
  startDate = null,
  endDate = null,
  estado = null,
  usuario = null
) {
  let query = `select pp."idProducto", pr."codInterno", "nombreProducto", sum("cantidadProducto") as "sumaTotal" from Pedidos pd 
  inner join Pedido_Producto pp on pp."idPedido"=pd."idPedido"
  inner join Usuarios us on us."idUsuario"=pd."idUsuarioCrea"
  inner join Productos pr on pr."idProducto"=pp."idProducto"
  where us."idAlmacen" = $1 `;
  const params = [idAgencia];
  if (startDate && endDate) {
    console.log("Flag 1");
    query += `AND TO_TIMESTAMP(pd."fechaCrea", 'DD/MM/YYYY HH24:MI:SS')::date >= TO_DATE($2, 'YYYY-MM-DD')
    AND TO_TIMESTAMP(pd."fechaCrea", 'DD/MM/YYYY HH24:MI:SS')::date <=  TO_DATE($3, 'YYYY-MM-DD')
    `;
    params.push(startDate, endDate);
  }
  if (estado) {
    query += ` and estado= '${estado}' `;
  }
  if (usuario) {
    query += ` and usuario= '${usuario}' `;
  }
  query += `group by pp."idProducto", "nombreProducto", "codInterno"
  order by cast(pp."idProducto" as int)`;

  try {
    console.log(query);
    const data = await client.query(query, [...params]);
    return data.rows;
  } catch (err) {
    console.log("Error", err);
    throw err;
  }
}

function SalesByStoreReport(startDate, endDate) {
  const query = `SELECT 
  (select nombre from Agencias where "idAgencia"=f."idAgencia" union 
   select nombre from Bodegas where "idBodega"=f."idAgencia" union 
   select 'Agencia Movil '|| placa as nombre from vehiculos v where v.placa=f."idAgencia") ,
  ROUND(SUM(CASE WHEN f.estado = 0 THEN "montoFacturar" ELSE 0 END)::numeric, 2) AS "totalFacturado",
  ROUND(SUM(CASE WHEN f.estado = 1 THEN "montoFacturar" ELSE 0 END)::numeric, 2) AS "totalAnulado"
FROM 
  facturas f
INNER JOIN 
  ventas v ON f."idFactura" = v."idFactura" 
where 
to_date(f."fechaHora", 'DD/MM/YYYY')>=to_date(${startDate}, 'YYYY-MM-DD') and 
to_date(f."fechaHora", 'DD/MM/YYYY')<=to_date(${endDate}, 'YYYY-MM-DD')
GROUP BY 
  f."idAgencia"
  order by f."idAgencia" desc
  ;
`;
  console.log("Llamando", query);
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

function SalesBySalespersonReport(startDate, endDate) {
  const query = `
  SELECT 
      (select nombre || ' ' || "apPaterno" || ' ' || "apMaterno" as "nombreVendedor" from Usuarios where "idUsuario"=v."idUsuarioCrea"),
      ROUND(SUM(CASE WHEN f.estado = 0 THEN "montoFacturar" ELSE 0 END)::numeric, 2) AS "totalFacturado",
      ROUND(SUM(CASE WHEN f.estado = 1 THEN "montoFacturar" ELSE 0 END)::numeric, 2) AS "totalAnulado"
  FROM 
      facturas f
  INNER JOIN 
      ventas v ON f."idFactura" = v."idFactura" 
  where 
    to_date(f."fechaHora", 'DD/MM/YYYY')>=to_date(${startDate}, 'YYYY-MM-DD') and 
    to_date(f."fechaHora", 'DD/MM/YYYY')<=to_date(${endDate}, 'YYYY-MM-DD')
  GROUP BY 
      v."idUsuarioCrea"
`;

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
  GeneralMarkdownsReport,
  GroupedProductsOrderReport,
  SalesByStoreReport,
  SalesBySalespersonReport,
};
