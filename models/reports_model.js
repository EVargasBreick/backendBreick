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
    fc."estado",
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
and fc."estado"!=1
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
  console.log("Params", params.fromHour);
  const { fromHour, toHour } = params;
  let generalQuery = `select  fc."idSucursal", fc."puntoDeVenta", fc."idOtroPago", fc."tipoPago", sum("importeBase") as "totalImporte", sum("pagado") as "totalPagado", sum("cambio") as "totalCambio", sum(fc.vale) as "totalVale", sum(fc.voucher) as "totalVoucher"
    from Facturas fc 
    where fc."puntoDeVenta"=${params.idPdv} and TO_DATE(fc."fechaHora",'DD/MM/YYYY')=CAST('${params.fecha}' AS Date )
    and fc."idAgencia"=${params.idAgencia} and fc.estado!=1 and fc."nroFactura"!='0' `;

  if (fromHour != "" && toHour != "") {
    generalQuery += ` AND TO_CHAR(TO_TIMESTAMP(fc."fechaHora", 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') BETWEEN '${fromHour}' AND '${toHour}'`;
  }

  generalQuery += `group by fc."idSucursal", "puntoDeVenta", fc."idOtroPago", fc."tipoPago" ;`;

  let canceledQuery = `select "nitCliente", "razonSocial", "nroFactura", "importeBase", "fechaAnulacion", "fechaHora" from facturas where estado='1' and "puntoDeVenta"=${params.idPdv} and TO_DATE("fechaHora",'DD/MM/YYYY')=CAST('${params.fecha}' AS Date )
  and "idAgencia"=${params.idAgencia}`;

  if (fromHour != "" && toHour != "") {
    canceledQuery += ` AND TO_CHAR(TO_TIMESTAMP("fechaHora", 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') BETWEEN '${fromHour}' AND '${toHour}'`;
  }

  console.log("Query fechas cierre:", generalQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const data = await client.query(generalQuery);
        const canceled = await client.query(canceledQuery);
        resolve({ totales: data.rows, anulados: canceled.rows });
      } catch (err) {
        console.log("ERROR", err);
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

function SalesBySalespersonReport(startDate, endDate, startHour, endHour) {
  let query = `
  SELECT 
      (select nombre || ' ' || "apPaterno" || ' ' || "apMaterno" as "nombreVendedor" from Usuarios where "idUsuario"=v."idUsuarioCrea"),
      ROUND(SUM(CASE WHEN f.estado = 0 THEN "montoFacturar" ELSE 0 END)::numeric, 2) AS "totalFacturado",
      ROUND(SUM(CASE WHEN f.estado = 1 THEN "montoFacturar" ELSE 0 END)::numeric, 2) AS "totalAnulado"
  FROM 
      facturas f
  INNER JOIN 
      ventas v ON f."idFactura" = v."idFactura" 
  where 
`;

  if (startHour != "" && endHour != "") {
    const complexStart = startDate + " " + startHour;
    const complexEnd = endDate + " " + endHour;
    query += `TO_TIMESTAMP(f."fechaHora", 'DD/MM/YYYY HH24:MI:SS') >= TO_TIMESTAMP('${complexStart}', 'YYYY-MM-DD HH24:MI:SS')
    AND TO_TIMESTAMP(f."fechaHora", 'DD/MM/YYYY HH24:MI:SS') <= TO_TIMESTAMP('${complexEnd}', 'YYYY-MM-DD HH24:MI:SS')`;
  } else {
    query += `to_date(f."fechaHora", 'DD/MM/YYYY')>=to_date('${startDate}', 'YYYY-MM-DD') and 
    to_date(f."fechaHora", 'DD/MM/YYYY')<=to_date('${endDate}', 'YYYY-MM-DD')`;
  }

  query += `GROUP BY 
  v."idUsuarioCrea"`;

  console.log("Query", query);
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

function virtualStockReport(params) {
  const query = `select av."idProducto","codInterno","nombreProducto", "cant_Actual", (dp.departamento) from almacen_virtual av 
    inner join productos pr on pr."idProducto"=av."idProducto"
    inner join departamentos dp on dp."idDepto"=(select "idDepartamento" from Zonas where "idZona"=${params.idZona})
    where "nitCliente"=${params.nitCliente} and av."idDepto"=(select "idDepartamento" from Zonas where "idZona"=${params.idZona})`;
  console.log("Query stock", query);
  return new Promise(async (resolve, reject) => {
    try {
      const data = await client.query(query);
      console.log("RESULTADOS", data);
      resolve(data.rows);
    } catch (err) {
      reject(err);
    }
  });
}

async function traspasosAgencyReport(startDate, endDate) {
  const query = `
  SELECT sum(tp."cantidadProducto") as product_count, t."idDestino" , p."codInterno", p."nombreProducto" , p."idProducto", COALESCE(a.nombre , b.nombre , v.placa) AS destination_name
  FROM traspaso_producto tp 
  JOIN traspasos t  ON tp."idTraspaso" = t."idTraspaso" 
  JOIN productos p  ON tp."idProducto"  = p."idProducto"
  LEFT JOIN agencias a on a."idAgencia"  = t."idDestino" 
  LEFT JOIN bodegas b on b."idBodega" = t."idDestino" 
  LEFT JOIN vehiculos v ON v.placa = t."idDestino" 
  WHERE TO_TIMESTAMP(t."fechaCrea", 'DD/MM/YYYY HH24.MI.SS')::DATE  BETWEEN ${startDate}::DATE AND ${endDate}::DATE
  and t.estado!=2
  GROUP BY t."idDestino", p."nombreProducto", p."codInterno", p."idProducto", COALESCE(a.nombre , b.nombre , v.placa)
  ORDER BY product_count desc;
  `;
  console.log("ESTE QUERY", query);
  try {
    const res = await client.query(query);
    return res.rows;
  } catch (err) {
    throw err;
  }
}
function GroupedProductReport(
  idAgencia,
  startDate,
  endDate,
  selectedClient,
  selectedSalesman,
  criteria
) {
  console.log("ID AGENCIAS", idAgencia);
  const agenciasString = [];
  if (idAgencia) {
    for (const agencia of idAgencia) {
      agenciasString.push(`'${agencia}'`);
    }
  }

  let query = `select pr."idProducto","codInterno", "nombreProducto", "unidadDeMedida",
  CASE
  WHEN SUM("cantidadProducto")::numeric % 1 = 0
      THEN CAST(SUM("cantidadProducto") AS integer)
  ELSE
    ROUND(SUM("cantidadProducto")::numeric, 2) 
  END AS "sumaTotal" 
  from Facturas fc inner join Ventas vn on vn."idFactura"=fc."idFactura"
  inner join clientes cl on cl."idCliente"=vn."idCliente"
  inner join venta_productos vp on vp."idVenta"=vn."idVenta"
  inner join Productos pr on pr."idProducto"=vp."idProducto"
  where estado=0 and 
   to_date(fc."fechaHora", 'DD/,MM/YYYY')>=to_date('${startDate}', 'YYYY-MM-DD') and 
   to_date(fc."fechaHora", 'DD/MM/YYYY')<=to_date('${endDate}', 'YYYY-MM-DD')
  `;

  let queryMoney = `
  select pr."idProducto","codInterno", "nombreProducto", "unidadDeMedida",
  sum("totalProd") AS "sumaTotal"
  from Facturas fc inner join Ventas vn on vn."idFactura"=fc."idFactura"
  inner join clientes cl on cl."idCliente"=vn."idCliente"
  inner join venta_productos vp on vp."idVenta"=vn."idVenta"
  inner join Productos pr on pr."idProducto"=vp."idProducto"
  where estado=0 and 
   to_date(fc."fechaHora", 'DD/,MM/YYYY')>=to_date('${startDate}', 'YYYY-MM-DD') and 
   to_date(fc."fechaHora", 'DD/MM/YYYY')<=to_date('${endDate}', 'YYYY-MM-DD')
  `;

  switch (criteria) {
    case "agencia":
      if (idAgencia) {
        query += `and "idAgencia" in (${agenciasString}) `;
        queryMoney += `and "idAgencia" in (${agenciasString}) `;
      }
      break;
    case "vendedor":
      query += `and vn."idUsuarioCrea"=${selectedSalesman} `;
      queryMoney += `and vn."idUsuarioCrea"=${selectedSalesman} `;
      break;
    case "cliente":
      query += `and cl.nit='${selectedClient}' `;
      queryMoney += `and cl.nit='${selectedClient}' `;
      break;
  }

  query += `group by (pr."idProducto","codInterno", "nombreProducto", "unidadDeMedida")
  order by "sumaTotal" desc`;
  queryMoney += `group by (pr."idProducto","codInterno", "nombreProducto", "unidadDeMedida")
  order by "sumaTotal" desc`;
  console.log("Query", query);
  return new Promise(async (resolve, reject) => {
    try {
      const data = await client.query(query);
      const dataMoney = await client.query(queryMoney);
      resolve({ cantidades: data.rows, facturado: dataMoney.rows });
    } catch (err) {
      reject(err);
      console.log("Error", err);
    }
  });
}

function GroupedSalesByProdSellerReport(startDate, endDate) {
  const query = `select pr."idProducto", pr."codInterno", pr."nombreProducto",us."idUsuario",us.rol , us."nombre", us."apPaterno", sum(vp."cantidadProducto")  as "totalVendido"
  from ventas vn inner join venta_productos vp on vp."idVenta"=vn."idVenta"
  inner join productos pr on pr."idProducto" =vp."idProducto" 
  inner join usuarios us on us."idUsuario" =vn."idUsuarioCrea"
  where  to_date(vn."fechaCrea", 'DD/MM/YYYY')>=to_date(${startDate}, 'YYYY-MM-DD') and 
  to_date(vn."fechaCrea", 'DD/MM/YYYY')<=to_date(${endDate}, 'YYYY-MM-DD')
  and us.rol!=1 and us.rol!=7 and us.rol!=11
  group by (pr."idProducto", pr."codInterno", pr."nombreProducto", us."idUsuario",us.rol, us."nombre", us."apPaterno")
  order by pr."codInterno"`;
  console.log("Data", query);
  return new Promise(async (resolve, reject) => {
    try {
      const data = await client.query(query);
      resolve(data.rows);
    } catch (err) {
      reject(err);
    }
  });
}

function SalesByDayReport(month, year) {
  const query = `select "idUsuario","nombre", "apPaterno", split_part("fechaHora", ' ',1), ROUND(SUM("importeBase")::numeric, 2)  from
  Facturas fc inner join Ventas vn on fc."idFactura"=vn."idFactura"
  inner join Usuarios us on us."idUsuario" =vn."idUsuarioCrea" 
  where "fechaHora" like '%/${month}/${year}%' and fc.estado=0
  group by ("idUsuario","nombre", "apPaterno", split_part("fechaHora", ' ',1))
  order by ("nombre",split_part("fechaHora", ' ',1))`;
  console.log("Data", query);
  return new Promise(async (resolve, reject) => {
    try {
      const data = await client.query(query);
      resolve(data.rows);
    } catch (err) {
      reject(err);
    }
  });
}

function MonthlyGoalReport(month, year) {
  const query = `select * from metas_diarias where fecha like '%/${month}/${year}%'`;
  console.log("Data", query);
  return new Promise(async (resolve, reject) => {
    try {
      const data = await client.query(query);
      resolve(data.rows);
    } catch (err) {
      reject(err);
    }
  });
}

async function GetRemainingGoal(date, userId) {
  const totalQuery = `select sum("importeBase") from Facturas fc inner join Ventas vn on vn."idFactura" =fc."idFactura" 
  where "idUsuarioCrea"=${userId} and to_date(fc."fechaHora",'DD/MM/YYYY')=to_date('${date}', 'DD/MM/YYYY') and fc.estado=0
  group by "idUsuarioCrea"`;
  const goalQuery = `select * from metas_diarias md where to_date("fecha",'DD/MM/YYYY')=to_date('${date}', 'DD/MM/YYYY') and "idUsuario"=${userId}`;
  return new Promise(async (resolve, reject) => {
    try {
      const total = await client.query(totalQuery);
      const goal = await client.query(goalQuery);
      const totalData = total.rows.length > 0 ? total.rows[0].sum : 0;
      const metaObj = goal.rows.length > 0 ? goal.rows[0].meta : 0;

      const respObj = {
        meta: metaObj,
        total: totalData,
        restante: metaObj - totalData,
        resultado: metaObj - totalData < 0,
      };

      console.log("Total data", totalData, goal.rows[0]);

      resolve(respObj);
    } catch (err) {
      reject(err);
    }
  });
}

async function GetSamplesReport(startDate, endDate, idAgencia, tipo) {
  const totalQuery = `SELECT *
  FROM (
      SELECT "idBaja", 
             CASE 
                 WHEN ci='-' THEN 'No disponible' 
                 ELSE (SELECT "razonSocial" FROM clientes cl WHERE cl.nit = bj.ci LIMIT 1)
             END AS cliente_razon_social, 
             ci, 
             "fechaBaja" AS "fecha", 
             us."usuario", 
             motivo as notas,
             'Baja agencia' as "tipoMuestra",
             bj."idAlmacen" as "idAgencia",
             case when bj.estado=1 then 'VALIDO' else 'CANCELADO' end as estado
      FROM bajas bj 
      INNER JOIN usuarios us ON bj."idUsuario" = us."idUsuario"  
      WHERE LOWER(motivo) LIKE '%muestra%' 
      and to_date("fechaBaja", 'DD/MM/YYYY') between to_date('${startDate}', 'YYYY-MM-DD') and to_date('${endDate}', 'YYYY-MM-DD')
      and bj."idAlmacen"='${idAgencia}'
  union 
      select  "idPedido", 
          "razonSocial",
          "nit", 
          pd."fechaCrea" as "fecha", 
          us.usuario, 
          "notas", 
          'Pedido' as "tipoMuestra",
          us."idAlmacen" as "idAgencia",
          case when pd.estado!='2' then 'VALIDO' else 'CANCELADO' end as estado
  from pedidos pd inner join clientes cl on cl."idCliente" =pd."idCliente"  
  inner join usuarios us on us."idUsuario" =pd."idUsuarioCrea" 
  where tipo='${tipo}' and  to_date(pd."fechaCrea", 'DD/MM/YYYY') between to_date('${startDate}', 'YYYY-MM-DD') and to_date('${endDate}', 'YYYY-MM-DD')
   and us."idAlmacen"='${idAgencia}'
  ) subquery
  ORDER BY TO_DATE(subquery."fecha", 'DD/MM/YYYY');
  `;
  console.log("Query muestras", totalQuery);
  return new Promise(async (resolve, reject) => {
    try {
      const reportData = await client.query(totalQuery);
      resolve(reportData.rows);
    } catch (err) {
      reject(err);
    }
  });
}

async function GetProductInSamplesReport(startDate, endDate, idAgencia, tipo) {
  const totalQuery = `SELECT *
  FROM (
      SELECT bj."idBaja",
      "codInterno",
      "nombreProducto",
      p."idProducto",
      p."precioDeFabrica",
      bp."cantProducto" as "cantidad",
             CASE 
                 WHEN ci='-' THEN 'No disponible' 
                 ELSE (SELECT "razonSocial" FROM clientes cl WHERE cl.nit = bj.ci LIMIT 1)
             END AS cliente_razon_social, 
             ci, 
             "fechaBaja" AS "fecha", 
             us."usuario", 
             motivo as notas,
             'Baja agencia' as "tipoMuestra",
             concat('AGENCIA00', bj."idBaja") as "tipo",
             bj."idAlmacen" as "idAgencia",
             case when bj.estado=1 then 'VALIDO' else 'CANCELADO' end as estado
      FROM bajas bj 
      INNER JOIN usuarios us ON bj."idUsuario" = us."idUsuario"  
      inner join baja_productos bp on bp."idBaja"=bj."idBaja"
      inner join productos p on p."idProducto" =bp."idProducto" 
      WHERE LOWER(motivo) LIKE '%muestra%' 
      and to_date("fechaBaja", 'DD/MM/YYYY') between to_date('${startDate}', 'YYYY-MM-DD') and to_date('${endDate}', 'YYYY-MM-DD')
      and bj."idAlmacen"='${idAgencia}' 
  union 
      select  pd."idPedido",
      "codInterno",
      		 "nombreProducto",
           p."idProducto",
           p."precioDeFabrica",
      		pp."cantidadProducto" as "cantidad" ,
          "razonSocial",
          "nit", 
          pd."fechaCrea" as "fecha", 
          us.usuario, 
          "notas", 
          'Pedido' as "tipoMuestra",
          concat(upper('${tipo}00'),pd."idPedido") as "tipo",
          us."idAlmacen" as "idAgencia",
          case when pd.estado!='2' then 'VALIDO' else 'CANCELADO' end as estado
  from pedidos pd inner join clientes cl on cl."idCliente" =pd."idCliente"  
  inner join usuarios us on us."idUsuario" =pd."idUsuarioCrea" 
  inner join pedido_producto pp on pp."idPedido"=pd."idPedido" 
  inner join productos p on p."idProducto" =pp."idProducto" 
  where tipo='${tipo}' and  to_date(pd."fechaCrea", 'DD/MM/YYYY') between to_date('${startDate}', 'YYYY-MM-DD') and to_date('${endDate}', 'YYYY-MM-DD')
   and us."idAlmacen"='${idAgencia}'
  ) subquery
  ORDER BY TO_TIMESTAMP(subquery."fecha", 'DD/MM/YYYY HH24:MI:SS');
  `;
  console.log("Query muestras", totalQuery);
  return new Promise(async (resolve, reject) => {
    try {
      const reportData = await client.query(totalQuery);
      resolve(reportData.rows);
    } catch (err) {
      reject(err);
    }
  });
}

async function getTransferProductsByStore(store, startDate, endDate) {
  try {
    const query = `select pr."idProducto","codInterno","nombreProducto", "precioDeFabrica", "cantidadProducto", tr."idTraspaso", concat('TRASPASO00',tr."idTraspaso") as codigo from 
    traspasos tr inner join traspaso_producto tp on tp."idTraspaso"=tr."idTraspaso" inner join productos pr on pr."idProducto"=tp."idProducto"
    where tr.estado!=2 and tr."idOrigen"=$1 and to_date(tr."fechaCrea",'DD/MM/YYYY') between to_date($2, 'YYYY-MM-DD') and to_date($3, 'YYYY-MM-DD')`;
    const reportData = await client.query(query, [store, startDate, endDate]);
    return reportData.rows;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getSimpleTransferReport(store, startDate, endDate) {
  try {
    const query = `select "idTraspaso","idOrigen", "idDestino",tr."fechaCrea", usuario, tr.estado, tr.movil from Traspasos tr inner join Usuarios us on tr."idUsuario"=us."idUsuario"
    where tr."idOrigen"=$1 and to_date(tr."fechaCrea",'DD/MM/YYYY') between to_date($2, 'YYYY-MM-DD') and to_date($3, 'YYYY-MM-DD') order by cast("idTraspaso" as int) desc`;
    const reportData = await client.query(query, [store, startDate, endDate]);
    return reportData.rows;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getDailyDiscountsReport(date) {
  try {
    const query = `select "idUsuarioCrea",usuario , concat("nombre",' ',"apPaterno") as nombre_completo, count(descuento), sum(v."descuentoCalculado")  from ventas v 
    inner join usuarios u on u."idUsuario"=v."idUsuarioCrea" 
    inner join facturas f on f."idFactura"=v."idFactura" 
    where descuento>0  and f.estado='0'
    and to_date(f."fechaHora",'DD/MM/YYYY')=to_date('${date}','YYYY-MM-DD')
    group by ("idUsuarioCrea", usuario,concat("nombre",' ',"apPaterno")) 
    order by sum(v."descuentoCalculado") desc`;

    const queryDetails = `select f."idFactura", f.cuf, f."fechaHora","idUsuarioCrea",usuario , f."nroFactura", concat("nombre",' ',"apPaterno") as nombre_completo, f."nitCliente",f."razonSocial", f."importeBase", v."montoTotal", descuento, v."descuentoCalculado"  from ventas v 
    inner join usuarios u on u."idUsuario"=v."idUsuarioCrea" 
    inner join facturas f on f."idFactura"=v."idFactura" 
    where descuento>0  and f.estado='0'
    and to_date(f."fechaHora",'DD/MM/YYYY')=to_date('${date}','YYYY-MM-DD') 
    order by usuario desc`;

    console.log("Query details", queryDetails);

    const reportData = await client.query(query);
    const reportDataDetails = await client.query(queryDetails);
    return { general: reportData.rows, details: reportDataDetails.rows };
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getCanceledInvoices(idAgencia, fromDate, toDate) {
  const query = `select "nitCliente", "razonSocial", cuf, "fechaHora", "fechaAnulacion", "nroFactura", "puntoDeVenta", "importeBase" from Facturas
    where "idAgencia"=$1 and to_date("fechaAnulacion", 'DD/MM/YYYY') between to_date($2, 'YYYY-MM-DD') and to_date($3, 'YYYY-MM-DD') and estado=1
    order by cast("idFactura" as int) desc`;
  try {
    const data = await client.query(query, [idAgencia, fromDate, toDate]);
    return data.rows;
  } catch (error) {
    return Promise.reject(error);
  }
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
  virtualStockReport,
  traspasosAgencyReport,
  GroupedProductReport,
  GroupedSalesByProdSellerReport,
  SalesByDayReport,
  MonthlyGoalReport,
  GetRemainingGoal,
  GetSamplesReport,
  GetProductInSamplesReport,
  getTransferProductsByStore,
  getSimpleTransferReport,
  getDailyDiscountsReport,
  getCanceledInvoices,
};
