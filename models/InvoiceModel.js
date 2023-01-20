const dbConnection = require("../server");
const dateString = require("../services/dateServices");

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
            fechaAnulacion
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
            '0',
            '${body.importeBase}',
            '${body.debitoFiscal}',
             '${body.desembolsada}',
             '${body.autorizacion}',
             '${body.cufd}',
             '${body.fechaEmision}',
             ${body.nroTransaccion},
             '-'
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

module.exports = {
  createInvoice,
  deleteInvoice,
  getInvoiceProducts,
  cancelInvoice,
};
