const {
  getIncompleteInvoicesList,
  updateInvoicePos,
} = require("../models/invoice_model");
const { InvoiceOut } = require("../models/xml_model");

function logIncompleteInvoices() {
  console.log("Buscando datos de facturas");
  const listOfInvoices = getIncompleteInvoicesList();
  listOfInvoices.then(async (list) => {
    for (const item of list) {
      console.log("Factura a ser procesada", item);
      const requestBody = {
        nit: process.env.NIT_EMPRESA,
        id: item.nroTransaccion,
      };
      try {
        await runEverything(requestBody, item);
      } catch (err) {
        console.log("ERROR");
      }
    }
  }).catch((err) => {
    console.log(err);
  });;
}

async function runEverything(requestBody, item) {
  return new Promise((resolve, reject) => {
    const dataOut = InvoiceOut(requestBody);
    dataOut
      .then((data) => {
        console.log(
          "FLAG",
          data.SalidaTransaccionBoliviaResponse[0]
            .SalidaTransaccionBoliviaResult[0].TransaccionSalidaUnificada[0]
            .Errores[0].Error[0]
        );
        const respuesta =
          data.SalidaTransaccionBoliviaResponse[0]
            .SalidaTransaccionBoliviaResult[0].TransaccionSalidaUnificada[0];
        const invoiceState =
          data.SalidaTransaccionBoliviaResponse[0]
            .SalidaTransaccionBoliviaResult[0].Transaccion[0].Estado[0];
        const cuf = respuesta.CUF[0];
        const cufd = respuesta.CUFD[0];
        const autorizacion = respuesta.Autorizacion[0];
        const fechaEmision = respuesta.FECHAEMISION[0];
        const idTrac = item.nroTransaccion;
        const nroFac = item.nroFactura;
        const idFac = item.idFactura;
        const bodyinv = {
          nroFactura: nroFac,
          cuf: cuf,
          cufd: cufd,
          autorizacion: autorizacion,
          nroTransaccion: idTrac,
          fe: fechaEmision,
          idFactura: idFac,
        };
        console.log("Resultado de la transaccion", invoiceState);
        if (invoiceState == "Transacción Exitosa") {
          console.log("A actualizar", bodyinv);
          const updated = updateInvoicePos(bodyinv);
          updated
            .then((resp) => {
              setTimeout(() => {
                resolve(resp);
              }, 5000);
            })
            .catch((error) => reject(error));
        }
      })
      .catch((err) => {
        console.log("ERROR");
      });
  });
}

module.exports = logIncompleteInvoices;
