const {
  getIncompleteInvoices,
  updateInvoicePos,
  updateIncompleteInvoices,
} = require("../models/invoice_model");
const { InvoiceOut } = require("../models/xml_model");
const PDFDocument = require("pdfkit-table");
var fs = require("fs");
const qr = require("qr-image");
const PDFTable = require("pdfkit-table");
const nodemailer = require("nodemailer");
const { convertToText } = require("./numbersToText");
const { sendInvoiceGmail } = require("../controllers/node_mailer_controller");
function formattedCuf(cuf) {
  const regex = new RegExp(".{1,30}", "g");
  const result = cuf.match(regex).join(" ");
  return result;
}
const path = require("path");
function formatDateAndTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  const date = dateTime.toLocaleDateString("en-GB"); // Formats date as DD/MM/YYYY
  const time = dateTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }); // Formats time as HH:mm
  return { date, time };
}

async function getInvoicesIncomplete() {
  const invoiceList = getIncompleteInvoices();
  invoiceList.then(async (response) => {
    const originalArray = response;
    let filteredArray = originalArray.filter((obj, index, arr) => {
      return (
        arr.map((mapObj) => mapObj.idFactura).indexOf(obj.idFactura) === index
      );
    });
    for await (const fr of filteredArray) {
      console.log("Factura a ser procesada", fr);
      const products = originalArray.filter(
        (oa) => oa.idFactura === fr.idFactura
      );
      const invoiceObject = {
        nit: process.env.NIT_EMPRESA,
        id: fr.nroTransaccion,
      };
      try {
        await runEverything(invoiceObject, products, fr);
      } catch (err) {
        console.log("Catcheo");
      }
    }
  });
}

async function runEverything(invoiceObject, products, fr) {
  console.log("Entro aca");
  return new Promise((resolve) => {
    const invoiceData = InvoiceOut(invoiceObject);
    invoiceData
      .then(async (res) => {
        const invoiceState =
          res.SalidaTransaccionBoliviaResponse[0]
            .SalidaTransaccionBoliviaResult[0].Transaccion[0].Estado[0];
        console.log("respuesta transaction", invoiceState);
        if (invoiceState == "Transacción Exitosa") {
          const respuesta =
            res.SalidaTransaccionBoliviaResponse[0]
              .SalidaTransaccionBoliviaResult[0].TransaccionSalidaUnificada[0];
          const cuf = respuesta.CUF[0];
          const cufd = respuesta.CUFD[0];
          const autorizacion = respuesta.Autorizacion[0];
          const fechaEmision = respuesta.FECHAEMISION[0];
          const idTrac = fr.nroTransaccion;
          const nroFac = fr.nroFactura;
          const idFac = fr.idFactura;
          const body = {
            nroFactura: nroFac,
            cuf: cuf,
            cufd: cufd,
            autorizacion: autorizacion,
            nroTransaccion: idTrac,
            fe: fechaEmision,
            idFactura: idFac,
          };
          console.log("fecha emision", fechaEmision);
          console.log("Cuf", cuf);
          const { date, time } = formatDateAndTime(fechaEmision);

          const convertido = convertToText(fr.montoFacturar);
          const qrData = `https://siat.impuestos.gob.bo/consulta/QR?nit=${process.env.NIT_EMPRESA}&cuf=${cuf}&numero=${nroFac}`;
          const qrImage = qr.imageSync(qrData, { type: "png" });
          const pagosArray = [
            "Efectivo",
            "Tarjeta",
            "Cheque",
            "Vales",
            "Otros",
            "Pago Posterior",
            "Transferencia",
            "Depósito en Cuenta",
            "Transferencia Swift",
            "Efectivo - Tarjeta",
          ];
          const doc = new PDFDocument({
            size: [250, 990 + products.length * 30],
            margins: { top: 10, bottom: 10, left: 10, right: 10 },
          });

          const selectedData = products.map((obj) => ({
            options: {
              fontSize: 10,
              separation: false,
            },
            cantProd: obj.cantidadProducto,
            detalle: obj.nombreProducto,
            unit: parseFloat(
              parseFloat(obj.totalProd) / parseFloat(obj.cantidadProducto)
            ).toFixed(2),
            desc: parseFloat(obj.descuentoProducto).toFixed(2),
            subTotal: parseFloat(obj.totalProd).toFixed(2),
          }));
          const table = {
            headers: [
              {
                label: "Cant",
                property: "cantProd",
                width: 30,
                renderer: null,
                headerColor: "#FFFFFF",
                align: "center",
              },
              {
                label: "Detalle",
                property: "detalle",
                width: 85,
                renderer: null,
                headerColor: "#FFFFFF",
              },
              {
                label: "Unit",
                property: "unit",
                width: 35,
                renderer: null,
                headerColor: "#FFFFFF",
              },
              {
                label: "Desc",
                property: "desc",
                width: 35,
                renderer: null,
                headerColor: "#FFFFFF",
              },
              {
                label: "Sub Total",
                property: "subTotal",
                width: 35,
                renderer: null,
                headerColor: "#FFFFFF",
              },
            ],
            datas: selectedData,
          };
          const table2 = {
            headers: [
              {
                label: "",
                property: "cantProd",
                width: 130,
                renderer: null,
                headerColor: "#FFFFFF",
                align: "left",
              },
              {
                label: "",
                property: "cantProd",
                width: 80,
                renderer: null,
                headerColor: "#FFFFFF",
                align: "right",
              },
            ],
            options: { hideHeader: true },
            rows: [
              [
                "Total\nDescuento\nTotal Fact",
                `${parseFloat(fr.montoTotal).toFixed(2)}\n${parseFloat(
                  fr.descuentoCalculado
                ).toFixed(2)}\n${parseFloat(fr.montoFacturar).toFixed(2)}`,
              ],
            ],
          };
          const tablePayed = {
            headers: [
              {
                label: "",
                property: "cantProd",
                width: 130,
                renderer: null,
                headerColor: "#FFFFFF",
                lineHeight: 0.2,
                align: "left",
              },
              {
                label: "",
                property: "cantProd",
                width: 80,
                renderer: null,
                headerColor: "#FFFFFF",
                lineHeight: 0.2,
                align: "right",
              },
            ],
            options: { hideHeader: true },
            rows: [
              [
                `Recibidos\n${pagosArray[fr.tipoPago - 1]}\nBs\nCambio`,
                `${parseFloat(fr.pagado).toFixed(2)}\n\n\n${parseFloat(
                  fr.cambio
                ).toFixed(2)}`,
              ],
            ],
          };
          doc.pipe(
            fs.createWriteStream(
              `factura-${nroFac}-${fr.nitCliente}-caja_${
                fr.puntoDeVenta + 1
              }.pdf`
            )
          );
          doc
            .font("Helvetica")
            .fontSize(9)
            .text("Incadex S.R.L", { align: "center" })
            .fontSize(9)
            .text(fr.nombre, { align: "center", margin: [0, 12] })
            .moveDown()
            .text(fr.direccion, { align: "center" })
            .text(`Teléfono: ${fr.telefono}`, { align: "center" })
            .text(`${fr.ciudad} - Bolivia`, { align: "center" })
            .text(`Sucursal No ${fr.idImpuestos}`, { align: "center" })
            .moveDown()
            .text("FACTURA", { align: "center" })
            .moveDown()
            .text("ORIGINAL", { align: "center" })
            .moveDown()
            .text(`NIT ${process.env.NIT_EMPRESA}`, { align: "center" })
            .text(`FACTURA  Nº ${fr.nroFactura}`, { align: "center" })
            .text(`CUF:`, { align: "center" })
            .text(`${formattedCuf(cuf)}`, { align: "center" })
            .moveDown()
            .moveDown()
            .font("Helvetica")
            .fontSize(9)
            .text(
              "Elaboración de otros productos alimenticios (Tostado, torrado, molienda de cafe, elab. De Té, mates, miel artificial, chocolates. etc.)",
              { align: "center", margin: [0, 12] }
            )
            .moveDown()
            .fontSize(9)
            .text(`Fecha: ${date}   Hora: ${time}`, { margin: [0, 12] })
            .text(`Señor(es): ${fr.razonSocial}`, { margin: [0, 12] })
            .text(`NIT/CI: ${fr.nitCliente}`, { margin: [0, 12] })
            .moveDown()
            .fontSize(9)

            .moveDown();
          doc.font("Helvetica").fontSize(9);
          doc.table(table, {
            prepareHeader: () => doc.font("Helvetica").fontSize(9),
            prepareRow: () => doc.font("Helvetica").fontSize(9),
            divider: {
              header: { disabled: true, width: 0.0, opacity: 0.5 },
              horizontal: { disabled: true, width: 0.0, opacity: 0.5 },
            },
          });
          doc.fontSize(10);
          doc.table(table2, {
            hideHeader: true,
            prepareHeader: () => doc.font("Helvetica").fontSize(9),
            prepareRow: () => doc.font("Helvetica").fontSize(9),
            divider: {
              header: { disabled: true, width: 0.0, opacity: 0.5 },
              horizontal: { disabled: true, width: 0.0, opacity: 0.5 },
            },
            padding: 1,
          });
          doc
            .moveDown()
            .text(
              ` Son: ${convertido?.texto.toUpperCase()} CON ${
                convertido.resto
              }/100`
            )
            .text(" Bolivianos");
          doc.table(tablePayed, {
            hideHeader: true,
            prepareHeader: () => doc.font("Helvetica").fontSize(9),
            prepareRow: () => doc.font("Helvetica").fontSize(9),
            divider: {
              header: { disabled: true, width: 0.0, opacity: 0.5 },
              horizontal: { disabled: true, width: 0.0, opacity: 0.5 },
            },
            padding: 1,
          });
          doc.moveDown().image(qrImage, {
            fit: [220, 100],
            align: "center",
            valign: "center",
          });
          doc
            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .text(
              `"Esta factura contribuye al desarrollo del pais. El uso ilícito de esta será sancionado acuerdo a la ley"`,
              { align: "center" }
            )
            .moveDown()
            .text(
              `Ley Nº 453: El proveedor debe brindar atención sin discriminación, con respeto, calidez y cordialidad a los usuarios`,
              { align: "center" }
            )
            .moveDown()
            .moveDown()
            .moveDown()
            .text("GRACIAS POR SU COMPRA!", { align: "center" })
            .moveDown()
            .moveDown()
            .text("No se aceptan cambios ni devoluciones*", {
              align: "center",
            })
            .moveDown()
            .moveDown()
            .text(`Atendido por: ${fr.usuario} en Caja: ${fr.puntoDeVenta + 1}`)
            .moveDown()
            .moveDown()
            .moveDown();
          doc.end();

          const invoiceUpdated = updateInvoicePos(body);
          invoiceUpdated
            .then((res) => {
              const emitida = updateIncompleteInvoices(
                fr.idFacturaIncompleta,
                1
              );
              emitida.then(async (em) => {
                const pdfPath = path.join(
                  __dirname,
                  "..",
                  `factura-${nroFac}-${fr.nitCliente}-caja_${
                    fr.puntoDeVenta + 1
                  }.pdf`
                );
                const mailArray =
                  fr.correoCliente != ""
                    ? [fr.correoCliente, fr.correoAgencia]
                    : [fr.correoAgencia];
                const sended = sendInvoiceGmail(
                  mailArray,
                  pdfPath,
                  `factura-${nroFac}-${fr.nitCliente}-caja_${
                    fr.puntoDeVenta + 1
                  }.pdf`
                );
                sended
                  .then((res) => {
                    console.log(res);
                    fs.unlink(pdfPath, (err) => {
                      if (err) {
                        console.log(err);
                      } else {
                        setTimeout(() => {
                          resolve(true);
                        }, 4000);
                        console.log("PDF file deleted");
                      }
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              });
            })
            .catch((err) => {
              console.log("Error al actualizar", err);
            });
        } else {
          console.log("COMPROBANTE RECHAZADO");
          const emitida = updateIncompleteInvoices(fr.idFacturaIncompleta, 4);
          emitida.then((res) => {
            setTimeout(() => {
              resolve(true);
            }, 4000);
          });
        }
      })
      .catch((err) => {
        console.log("ERROR AL OBTENER EL COMPROBANTE", err);
        const emitida = updateIncompleteInvoices(fr.idFacturaIncompleta, 3);
        emitida.then((res) => {
          setTimeout(() => {
            resolve(true);
          }, 4000);
        });
      });
  });
}

module.exports = getInvoicesIncomplete;
