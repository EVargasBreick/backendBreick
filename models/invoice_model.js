const logger = require("../logger-pino");
const { client } = require("../postgressConn");
const dbConnection = require("../server");
const dateString = require("../services/dateServices");
const { formatError } = require("../services/formatError");
const { toFixedDecimals } = require("../services/toFixedDecimals");

function createInvoice(body) {
  const invoiceQuery = `
        insert into Facturas (
            nroFactura,
            idSucursal,
            nitEmpresa,
            fechaHora,
            nitCliente,
            razonSocial,
            tipoPago,
            pagado,
            cambio,
            nroTarjeta,
            cuf, 
            estado,
            importeBase,
            debitoFiscal,
            desembolsada,
            autorizacion,
            cufd,
            fechaEmision,
            nroTransaccion,
            fechaAnulacion,
            idOtroPago,
            vale,
            puntoDeVenta
        ) values (
            '${body.nroFactura}',
            ${body.idSucursal},
            '${body.nitEmpresa}',
            '${body.fechaHora}',
            '${body.nitCliente}',
            '${body.razonSocial}',
            ${body.tipoPago},
            ${body.pagado},
            ${body.cambio},
            '${body.nroTarjeta}',
            '${body.cuf}',
            '${body.aPagar}',
            '${body.importeBase}',
            '${body.debitoFiscal}',
             '${body.desembolsada}',
             '${body.autorizacion}',
             '${body.cufd}',
             '${body.fechaEmision}',
             ${body.nroTransaccion},
             '-',
             ${body.idOtroPago},
             ${body.vale},
             ${body.puntoDeVenta}
        )`;

  return new Promise((resolve, reject) => {
    console.log("Query factura", invoiceQuery);
    setTimeout(async () => {
      const added = await dbConnection.executeQuery(invoiceQuery);
      if (added.success) {
        const idCreado = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Facturas') as 'idCreado'`
        );
        console.log("Se llegooo");
        resolve({
          factura: added,
          idCreado: idCreado.data[0][0].idCreado,
        });
      } else {
        console.log("Error al facturar", added);
        reject(added);
      }
    }, 200);
  });
}

function deleteInvoice(id) {
  const deleteQuery = `delete from Facturas where idFactura=${id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const deleted = await dbConnection.executeQuery(deleteQuery);
      if (deleted.success) {
        resolve(deleted);
      } else {
        reject(deleted);
      }
    }, 100);
  });
}

function getInvoiceProducts(params) {
  const productsQuery = `select fr.*, pr.idProducto, pr.nombreProducto, sc.idString as idAlmacen, sc.idImpuestos,
  vp.cantidadProducto as cantProducto, vn.montoFacturar
  from Facturas fr 
  inner join ventas vn on vn.idFactura=fr.idFactura 
  inner join Venta_Productos vp on vp.idVenta=vn.idVenta
  inner join Productos pr on pr.idProducto=vp.idProducto
  inner join Sucursales sc on sc.idImpuestos=fr.idSucursal 
  where sc.idString=${params.idSucursal} and fr.estado=0`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const invoices = await dbConnection.executeQuery(productsQuery);
      if (invoices.success) {
        resolve(invoices);
      } else {
        reject(invoices);
      }
    }, 100);
  });
}

function cancelInvoice(params) {
  const dateResult = dateString();
  const cancelQuery = `update Facturas set estado=1, fechaAnulacion='${dateResult}' where idFactura=${params.id}`;
  console.log("Anulando", cancelQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const canceled = await dbConnection.executeQuery(cancelQuery);
      if (canceled.success) {
        resolve(canceled);
      } else {
        reject(canceled);
      }
    }, 100);
  });
}

function getOtherPayments() {
  const deleteQuery = `Select * from Otros_Pagos`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const list = await dbConnection.executeQuery(deleteQuery);
      if (list.success) {
        resolve(list);
      } else {
        reject(list);
      }
    }, 100);
  });
}

// POSTGRES

function createInvoicePos(body) {
  const {
    nroFactura,
    idSucursal,
    nitEmpresa,
    fechaHora,
    nitCliente,
    razonSocial,
    tipoPago,
    pagado,
    cambio,
    nroTarjeta,
    cuf,
    aPagar,
    importeBase,
    debitoFiscal,
    desembolsada,
    autorizacion,
    cufd,
    fechaEmision,
    nroTransaccion,
    idOtroPago,
    vale,
    puntoDeVenta,
    idAgencia,
    voucher,
    pya,
  } = body;

  const invoiceQuery = `
    INSERT INTO Facturas (
        "nroFactura",
        "idSucursal",
        "nitEmpresa",
        "fechaHora",
        "nitCliente",
        "razonSocial",
        "tipoPago",
        "pagado",
        "cambio",
        "nroTarjeta",
        cuf, 
        estado,
        "importeBase",
        "debitoFiscal",
        "desembolsada",
        autorizacion,
        cufd,
        "fechaEmision",
        "nroTransaccion",
        "fechaAnulacion",
        "idOtroPago",
        vale,
        "puntoDeVenta",
        "idAgencia",
        voucher,
        pya
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
    ) RETURNING "idFactura"`;

  const queryValues = [
    nroFactura,
    idSucursal,
    nitEmpresa,
    fechaHora,
    nitCliente,
    razonSocial,
    tipoPago,
    toFixedDecimals(pagado),
    toFixedDecimals(cambio),
    nroTarjeta,
    cuf,
    aPagar,
    toFixedDecimals(importeBase),
    toFixedDecimals(debitoFiscal),
    desembolsada,
    autorizacion,
    cufd,
    fechaEmision,
    nroTransaccion,
    "-",
    idOtroPago,
    vale,
    puntoDeVenta,
    idAgencia,
    voucher,
    pya ? 1 : 0,
  ];

  return new Promise((resolve, reject) => {
    console.log("New invoice", invoiceQuery, queryValues, body);
    setTimeout(async () => {
      try {
        const added = await client.query(invoiceQuery, queryValues);
        console.log("Se llegooo");
        resolve({
          factura: added,
          idCreado: added.rows[0].idFactura,
        });
      } catch (err) {
        logger.error("createInvoicePos: " + formatError(err));
        console.log("Error al facturar", err);
        reject(err);
      }
    }, 200);
  });
}

function deleteInvoicePos(id) {
  const deleteQuery = `delete from Facturas where "idFactura"=${id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const deleted = await client.query(deleteQuery);
        resolve(deleted);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function updateInvoicePos(body) {
  const deleteQuery = `update Facturas set 
  "nroFactura"=${body.nroFactura}, cuf='${body.cuf}', cufd='${body.cufd}', 
  autorizacion='${body.autorizacion}', "nroTransaccion"=${body.nroTransaccion}, "fechaEmision"='${body.fe}' where "idFactura"=${body.idFactura}`;
  return new Promise((resolve, reject) => {
    console.log("Actualizar", deleteQuery);
    setTimeout(async () => {
      try {
        const deleted = await client.query(deleteQuery);
        resolve(deleted);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getInvoiceProductsPos(params) {
  const productsQuery = `
  SELECT fr.*, pr."idProducto", pr."nombreProducto",
  vp."cantidadProducto" as "cantProducto", vn."montoFacturar"
FROM Facturas fr
INNER JOIN ventas vn ON vn."idFactura" = fr."idFactura"
INNER JOIN Venta_Productos vp ON vp."idVenta" = vn."idVenta"
INNER JOIN Productos pr ON pr."idProducto" = vp."idProducto"
WHERE fr."idAgencia" = ${params.idSucursal}
  AND fr."puntoDeVenta" = ${params.pdv}
  AND fr.estado != 1
  AND ((
    EXTRACT(MONTH FROM to_date("fechaHora", 'DD/MM/YYYY')) = EXTRACT(MONTH FROM current_date)
    AND EXTRACT(YEAR FROM to_date("fechaHora", 'DD/MM/YYYY')) = EXTRACT(YEAR FROM current_date)
  )
  OR (
    EXTRACT(DAY FROM current_date) <= 9
    AND (
      EXTRACT(MONTH FROM to_date("fechaHora", 'DD/MM/YYYY')) = EXTRACT(MONTH FROM current_date) - 1
      OR (
        EXTRACT(MONTH FROM to_date("fechaHora", 'DD/MM/YYYY')) = 12
        AND EXTRACT(MONTH FROM current_date) = 1
        AND EXTRACT(YEAR FROM to_date("fechaHora", 'DD/MM/YYYY')) = EXTRACT(YEAR FROM current_date) - 1
      )
    )
  ));
  `;
  return new Promise((resolve, reject) => {
    console.log("Query facturitas ", productsQuery);
    setTimeout(async () => {
      try {
        const invoices = await client.query(productsQuery);
        resolve(invoices.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function cancelInvoicePos(params) {
  const dateResult = dateString();
  const cancelQuery = `update Facturas set estado=1, "fechaAnulacion"='${dateResult}' where "idFactura"=${params.id}`;
  console.log("Anulando", cancelQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const canceled = await client.query(cancelQuery);
        resolve(canceled.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getOtherPaymentsPos() {
  const deleteQuery = `Select * from Otros_Pagos`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const list = await client.query(deleteQuery);
        resolve(list.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function logIncompleteInvoice(body) {
  console.log("Body", body);
  const logQuery = `insert into Facturas_incompletas ("nroFactura","idSucursal", 
  "puntoDeVenta","nroTransaccion","idAgencia","correoCliente",emitida,"idFactura")
   values ('${body.nroFactura}',${body.idSucursal},${body.puntoDeVenta},${body.nroTransaccion},
   '${body.idAlmacen}','${body.correoCliente}',0,${body.idFactura}) returning "idFacturaIncompleta"`;
  console.log("Log query", logQuery);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const newLog = await client.query(logQuery);
        const idCreado = newLog.rows[0].idFacturaIncompleta;
        setTimeout(() => {
          resolve({ response: newLog.rows, idCreado: idCreado });
        }, 2000);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getIncompleteInvoices() {
  const query = `select fi."idFacturaIncompleta",fc."idFactura",sc."idImpuestos", bd.nombre, bd.telefono, fc."nitCliente", us."usuario", 
  "fechaHora", fc."nroFactura",fc."razonSocial", "nombreProducto", "cantidadProducto", "totalProd", 
  "descuentoProducto", vn."montoTotal", vn."montoFacturar", 
  vn."descuentoCalculado", pagado, cambio, "tipoPago", bd.direccion, zn."ciudad", 
  fi."nroTransaccion", ca.correo as "correoAgencia", fi."correoCliente", fc."puntoDeVenta"
  from Facturas_Incompletas fi
  inner join Facturas fc on fi."idFactura"=fc."idFactura"
  inner join Sucursales sc on sc."idImpuestos"=fc."idSucursal"
  inner join Ventas vn on vn."idFactura"=fc."idFactura"
  inner join Venta_Productos vp on vp."idVenta"=vn."idVenta"
  inner join Productos pr on pr."idProducto"=vp."idProducto"
  inner join Bodegas bd on bd."idBodega"=sc."idString"
  inner join Clientes cl on cl."idCliente"=vn."idCliente"
  inner join Usuarios us on us."idUsuario"=vn."idUsuarioCrea"
  inner join Zonas zn on zn."idZona"=bd."idZona"
  inner join correos_agencia ca on ca."idImpuestos"=sc."idImpuestos"
  where fi.emitida=0
  union
  select fi."idFacturaIncompleta",fc."idFactura" ,sc."idImpuestos", ag.nombre, ag.telefono, fc."nitCliente", us."usuario", 
  "fechaHora", fc."nroFactura",fc."razonSocial", "nombreProducto", "cantidadProducto", "totalProd", 
  "descuentoProducto", vn."montoTotal", vn."montoFacturar", 
  vn."descuentoCalculado", pagado, cambio, "tipoPago", ag.direccion, zn."ciudad", fi."nroTransaccion",
  ca.correo as "correoAgencia", fi."correoCliente", fc."puntoDeVenta"
  from Facturas_Incompletas fi
  inner join Facturas fc on fi."idFactura"=fc."idFactura"
  inner join Sucursales sc on sc."idImpuestos"=fc."idSucursal"
  inner join Ventas vn on vn."idFactura"=fc."idFactura"
  inner join Venta_Productos vp on vp."idVenta"=vn."idVenta"
  inner join Productos pr on pr."idProducto"=vp."idProducto"
  inner join Agencias ag on ag."idAgencia"=sc."idString"
  inner join Clientes cl on cl."idCliente"=vn."idCliente"
  inner join Usuarios us on us."idUsuario"=vn."idUsuarioCrea"
  inner join Zonas zn on zn."idZona"=ag."idZona"
  inner join correos_agencia ca on ca."idImpuestos"=sc."idImpuestos"
  where fi.emitida=0
  order by cast ("idFacturaIncompleta" as int)desc
`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const newLog = await client.query(query);
        resolve(newLog.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function updateIncompleteInvoices(id, emitida) {
  const updateInvoice = `update Facturas_Incompletas set emitida=${emitida} where "idFacturaIncompleta"=${id}`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const newLog = await client.query(updateInvoice);
        resolve(newLog.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getInvoiceToRePrint(params) {
  const queryInvoice = `select fc."idFactura",fc.cuf,sc."idImpuestos", bd.nombre, bd.telefono, fc."nitCliente", us."usuario", 
  "fechaHora", fc."nroFactura",fc."razonSocial", "nombreProducto", "cantidadProducto", "totalProd", 
  "descuentoProducto", vn."montoTotal", vn."montoFacturar", 
  vn."descuentoCalculado", pagado, cambio, "tipoPago", bd.direccion, zn."ciudad", 
  fc."puntoDeVenta", fc.vale
  from Facturas fc
  inner join Sucursales sc on sc."idImpuestos"=fc."idSucursal"
  inner join Ventas vn on vn."idFactura"=fc."idFactura"
  inner join Venta_Productos vp on vp."idVenta"=vn."idVenta"
  inner join Productos pr on pr."idProducto"=vp."idProducto"
  inner join Bodegas bd on bd."idBodega"=sc."idString"
  inner join Clientes cl on cl."idCliente"=vn."idCliente"
  inner join Usuarios us on us."idUsuario"=vn."idUsuarioCrea"
  inner join Zonas zn on zn."idZona"=bd."idZona"
  where fc."idAgencia"='${params.idAgencia}' and "puntoDeVenta"=${params.pdv} and fc."nroFactura"='${params.nroFactura}' 
  union
  select fc."idFactura",fc.cuf,sc."idImpuestos", ag.nombre, ag.telefono, fc."nitCliente", us."usuario", 
  "fechaHora", fc."nroFactura",fc."razonSocial", "nombreProducto", "cantidadProducto", "totalProd", 
  "descuentoProducto", vn."montoTotal", vn."montoFacturar", 
  vn."descuentoCalculado", pagado, cambio, "tipoPago", ag.direccion, zn."ciudad", 
  fc."puntoDeVenta", fc.vale
  from Facturas fc
  inner join Sucursales sc on sc."idImpuestos"=fc."idSucursal"
  inner join Ventas vn on vn."idFactura"=fc."idFactura"
  inner join Venta_Productos vp on vp."idVenta"=vn."idVenta"
  inner join Productos pr on pr."idProducto"=vp."idProducto"
  inner join Agencias ag on ag."idAgencia"=sc."idString"
  inner join Clientes cl on cl."idCliente"=vn."idCliente"
  inner join Usuarios us on us."idUsuario"=vn."idUsuarioCrea"
  inner join Zonas zn on zn."idZona"=ag."idZona"
  where fc."idAgencia"='${params.idAgencia}' and "puntoDeVenta"=${params.pdv} and fc."nroFactura"='${params.nroFactura}'`;
  return new Promise((resolve, reject) => {
    console.log("Query reimpresion", queryInvoice);
    setTimeout(async () => {
      try {
        const newLog = await client.query(queryInvoice);
        resolve(newLog.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

function getIncompleteInvoicesList() {
  const updateInvoice = `select * from Facturas where "cuf"='' and "nroTransaccion">0 and estado=0 order by cast ("idFactura" as int)`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const newLog = await client.query(updateInvoice);
        console.log("Data", newLog.rows);
        resolve(newLog.rows);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

module.exports = {
  createInvoice,
  deleteInvoice,
  getInvoiceProducts,
  cancelInvoice,
  getOtherPayments,
  createInvoicePos,
  deleteInvoicePos,
  getInvoiceProductsPos,
  cancelInvoicePos,
  getOtherPaymentsPos,
  updateInvoicePos,
  logIncompleteInvoice,
  getIncompleteInvoices,
  updateIncompleteInvoices,
  getInvoiceToRePrint,
  getIncompleteInvoicesList,
};
