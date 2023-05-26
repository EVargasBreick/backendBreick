const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const { createInvoicePos } = require("../models/invoice_model");
const { registerSalePos } = require("../models/sale_modal");
const app = express();

app.use(session(sessionParams));

module.exports = {
  invoiceProcess: (req, res) => {
    const createdInvoice = createInvoice(req.body);
    createdInvoice
      .then((invoice) => {
        res.status(200).send(invoice);
      })
      .catch((error) => {
        res.status(error.code).send(error);
      });
  },
};

const createInvoice = async (body) => {
  try {
    const invoiceResponse = await createEmizorInvoice(body.emizor);
    const data = invoiceResponse.data;
    body.invoice.nroFactura = data.numeroFactura;
    body.invoice.cuf = data.cuf;
    body.invoice.autorizacion = data.ack_ticket;
    body.invoice.cufd = data.shortLink;
    body.invoice.fecheEmision = data.fechaEmision;
    try {
      const invoiceCreated = await createInvoicePos(body.invoice);
      const idFactura = invoiceCreated.idCreado;
      body.venta.idFactura = idFactura;
      try {
        const saleCreated = await registerSalePos(body.venta);
        return {
          code: invoiceResponse.status,
          data: invoiceResponse,
          ids: {
            invoice: idFactura,
            sale: saleCreated.idCreado,
          },
        };
      } catch {
        return {
          code: 500,
          error: error,
          message: "Error al crear la venta",
        };
      }
    } catch (error) {
      return {
        code: 500,
        error: error,
        message: "Error al crear la factura",
      };
    }
  } catch (error) {
    return {
      code: error.status,
      error: error,
      message: "Error al enviar la factura a emizor",
    };
  }
};

const createEmizorInvoice = async () => {
  return 1;
};
