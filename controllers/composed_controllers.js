const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const { createInvoicePos } = require("../models/invoice_model");
const { registerSalePos } = require("../models/sale_modal");
const {
  updateProductStockPos,
  updateLogStockDetails,
} = require("../models/store_model");
const app = express();

app.use(session(sessionParams));

module.exports = {
  invoiceProcess: (req, res) => {
    const createdInvoice = createInvoice(req.body, req);
    createdInvoice
      .then((invoice) => {
        res.status(200).send(invoice);
      })
      .catch((error) => {
        res.status(error.code).send(error);
      });
  },
};

const createInvoice = async (body, req) => {
  try {
    const stockBody = {
      accion: "take",
      idAlmacen: body.stock.idAlmacen,
      productos: body.stock.productos,
      detalle: `-`,
    };
    console.log("Stock body", stockBody);
    const updatedStock = await updateProductStockPos(stockBody);
    if (updatedStock.code === 200) {
      console.log("Resultado de creacion de logs", updatedStock);
      const idsCreados = updatedStock.data;
      try {
        console.log("Update stock", updatedStock);
        const invoiceResponse = await createEmizorInvoice(
          body.emizor,
          body.storeInfo,
          req
        );
        const data = invoiceResponse.data;
        body.invoice.nroFactura = data.numeroFactura;
        body.invoice.cuf = data.cuf;
        body.invoice.autorizacion = data.ack_ticket;
        body.invoice.cufd = data.shortLink;
        body.invoice.fechaEmision = data.fechaEmision;
        try {
          const invoiceCreated = await createInvoicePos(body.invoice);
          console.log(
            "Invoice created",
            invoiceCreated.factura.rows[0].idFactura
          );
          body.venta.idFactura = invoiceCreated.factura.rows[0].idFactura;
          try {
            const saleCreated = await registerSalePos(
              body.venta,
              invoiceCreated.factura.rows[0].idFactura
            );
            const ventaCreada = JSON.parse(saleCreated);
            console.log("Sale created", ventaCreada);
            try {
              const updatedLogs = updateLogStockDetails(
                `NVAG-${ventaCreada.idCreado}`,
                idsCreados
              );
              return {
                code: 200,
                data: invoiceResponse,
              };
            } catch (error) {
              return {
                code: 500,
                error: error,
                message: "Error al actualizar los logs",
              };
            }
          } catch {
            return {
              code: 500,
              error: error,
              message: "Error al crear la venta",
            };
          }
        } catch (error) {
          try {
            const stockBody = {
              accion: "add",
              idAlmacen: body.stock.idAlmacen,
              productos: body.stock.productos,
              detalle: `CVAGN-0`,
            };
            console.log("Stock body", stockBody);
            const updatedStock = await updateProductStockPos(stockBody);
            return {
              code: 500,
              error: error,
              message: "Error al crear la factura",
            };
          } catch (error) {
            return {
              code: 500,
              error: error,
              message: "Error al devolver el stock",
            };
          }
        }
      } catch (error) {
        return {
          code: 500,
          error: error,
          message: "Error al enviar la factura a emizor",
        };
      }
    } else {
      return {
        code: 500,
        error: updatedStock,
        message:
          "Error al actualizar stock, algún producto no cuenta con la cantidad solicitada",
      };
    }
  } catch (error) {
    return {
      code: 500,
      error: error,
      message:
        "Error al actualizar stock, algún producto no cuenta con la cantidad solicitada",
    };
  }
};

const createEmizorInvoice = async () => {
  return new Promise((resolve) =>
    resolve({
      status: 200,
      data: {
        cuf: "8C4C20D9D24F8B6328419FD2D24D407AA7A9E06C91AF88829C17FD74",
        ack_ticket: "testAckTicket",
        urlSin: "testUrlSin",
        emision_type_code: 0,
        fechaEmision: "testFechaEm",
        numeroFactura: "testNro",
        shortLink: "testShortLink",
        codigoEstado: "testEstado",
      },
    })
  );
};
