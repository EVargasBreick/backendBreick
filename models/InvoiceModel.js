const dbConnection = require("../server");

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
            desembolsada
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
             '${body.desembolsada}'
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

module.exports = { createInvoice, deleteInvoice };
