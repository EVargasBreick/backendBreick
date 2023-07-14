const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const { createInvoicePos } = require("../models/invoice_model");
const { registerSalePos } = require("../models/sale_modal");
const {
  updateProductStockPos,
  updateLogStockDetails,
} = require("../models/store_model");
const { postFactura, getEstadoFactura } = require("../models/emizor_model");
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
      detalle: `NVAG-0`,
    };
    console.log("Stock body", stockBody);
    const updatedStock = await updateProductStockPos(stockBody);
    console.log("Log log", updatedStock);
    if (updatedStock.code === 200) {
      console.log("Resultado de creacion de logs", updatedStock);
      const idsCreados = updatedStock.data;
      console.log("Flag 1");
      try {
        const invoiceResponse = await postFactura(
          body.emizor,
          body.storeInfo,
          req
        );
        const data = JSON.parse(invoiceResponse).data.data;
        if (Number(data.emission_type_code) === 1) {
          try {
            const maxRetries = 50;
            let retries = 0;
            let stateData = null;
            const delay = (ms) =>
              new Promise((resolve) => setTimeout(resolve, ms));
            let estadoFactura = null;
            while (retries < maxRetries) {
              try {
                estadoFactura = await getEstadoFactura(req, data.ack_ticket);
                console.log("ESTADO DE LA FACTURA", estadoFactura);
                stateData = JSON.parse(estadoFactura).data.data.estado;
              } catch (error) {
                console.log("Error", error);

                return {
                  code: 500,
                  error: error,
                  message: "Error al obtener el estado de la factura",
                };
              }
              retries++;
              await delay(3000); // Delay between retries
              if (stateData === "VALIDA" || stateData === "RECHAZADA") {
                const autorizacion = `${body.emizor.extras.facturaTicket}$${data.ack_ticket}`;
                console.log("Autorizacion test", autorizacion);
                if (stateData === "VALIDA") {
                  try {
                    console.log("Resp de la factura", data);
                    body.invoice.nroFactura = data.numeroFactura;
                    body.invoice.cuf = data.cuf;
                    body.invoice.autorizacion = autorizacion;
                    body.invoice.cufd = data.shortLink;
                    body.invoice.fechaEmision = data.fechaEmision;
                    try {
                      const invoiceCreated = await createInvoicePos(
                        body.invoice
                      );
                      console.log(
                        "Invoice created",
                        invoiceCreated.factura.rows[0].idFactura
                      );
                      body.venta.idFactura =
                        invoiceCreated.factura.rows[0].idFactura;
                      try {
                        const saleCreated = await registerSalePos(
                          body.venta,
                          invoiceCreated.factura.rows[0].idFactura
                        );
                        const ventaCreada = JSON.parse(saleCreated);
                        console.log("Sale created", ventaCreada);
                        try {
                          const updatedLogs = await updateLogStockDetails(
                            `NVAG-${ventaCreada.idCreado}`,
                            idsCreados
                          );
                          return {
                            code: 200,
                            data: invoiceResponse,
                            leyenda:
                              JSON.parse(invoiceResponse).leyenda.descripcion,
                            message: "Factura correcta",
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
                        const updatedStock = await updateProductStockPos(
                          stockBody
                        );
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
                  } catch (err) {
                    return {
                      code: 500,
                      error: err,
                      message: "Error en el proceso de facturacion",
                    };
                  }
                } else {
                  try {
                    const stockBody = {
                      accion: "add",
                      idAlmacen: body.stock.idAlmacen,
                      productos: body.stock.productos,
                      detalle: `CVAGN-0`,
                    };
                    console.log("Stock body", stockBody);
                    const updatedStock = await updateProductStockPos(stockBody);
                    setTimeout(() => {
                      return {
                        code: 500,
                        error: estadoFactura,
                        message: "Factura rechazada, intente nuevamente",
                      };
                    }, 500);
                  } catch (error) {
                    return {
                      code: 500,
                      error: error,
                      message: "Error al devolver el stock",
                    };
                  }
                }
              }
              if (maxRetries === retries) {
                return {
                  code: 500,
                  error: "Maximo de intentos alcanzado",
                  message: "Maximo de intentos alcanzado",
                };
              }
            }
          } catch (error) {
            return {
              code: 500,
              error: error,
              message: "Error al obtener el estado de la factura",
            };
          }
        } else {
          console.log("Is not electronic invoice");
          try {
            const maxRetries = 50;
            let retries = 0;
            let stateData = null;
            const delay = (ms) =>
              new Promise((resolve) => setTimeout(resolve, ms));
            while (retries < maxRetries) {
              try {
                const estadoFactura = await getEstadoFactura(
                  req,
                  data.ack_ticket
                );
                console.log("Estado de la factura", estadoFactura);
                stateData = JSON.parse(estadoFactura).data.data.estado;
              } catch (error) {
                console.log("Error", error);

                return {
                  code: 500,
                  error: error,
                  message: "Error al obtener el estado de la factura",
                };
              }
              retries++;
              await delay(3000); // Delay between retries
              if (
                stateData === "VALIDA" ||
                stateData === "RECHAZADA" ||
                stateData === "PENDIENTE"
              ) {
                const autorizacion = `${body.emizor.extras.facturaTicket}$${data.ack_ticket}`;
                console.log("Autorizacion test", autorizacion);
                if (stateData === "VALIDA" || stateData === "PENDIENTE") {
                  try {
                    const autorizacion = `${body.emizor.extras.facturaTicket}$${data.ack_ticket}`;
                    console.log("Autorizacion test", autorizacion);
                    console.log("Resp de la factura", data);
                    body.invoice.nroFactura = data.numeroFactura;
                    body.invoice.cuf = data.cuf;
                    body.invoice.autorizacion = autorizacion;
                    body.invoice.cufd = data.shortLink;
                    body.invoice.fechaEmision = data.fechaEmision;
                    try {
                      const invoiceCreated = await createInvoicePos(
                        body.invoice
                      );
                      console.log(
                        "Invoice created",
                        invoiceCreated.factura.rows[0].idFactura
                      );
                      body.venta.idFactura =
                        invoiceCreated.factura.rows[0].idFactura;
                      try {
                        const saleCreated = await registerSalePos(
                          body.venta,
                          invoiceCreated.factura.rows[0].idFactura
                        );
                        const ventaCreada = JSON.parse(saleCreated);
                        console.log("Sale created", ventaCreada);
                        try {
                          const updatedLogs = await updateLogStockDetails(
                            `NVAG-${ventaCreada.idCreado}`,
                            idsCreados
                          );
                          return {
                            code: 200,
                            data: invoiceResponse,
                            leyenda:
                              JSON.parse(invoiceResponse).leyenda.descripcion,
                            message: "Factura correcta",
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
                        const updatedStock = await updateProductStockPos(
                          stockBody
                        );
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
                  } catch (err) {
                    return {
                      code: 500,
                      error: err,
                      message: "Error en el proceso de facturacion",
                    };
                  }
                } else {
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
                      error: stateData,
                      message: "Factura rechazada, intente nuevamente",
                    };
                  } catch (error) {
                    return {
                      code: 500,
                      error: error,
                      message: "Error al devolver el stock",
                    };
                  }
                }
              }
              if (maxRetries === retries) {
                return {
                  code: 500,
                  error: "Maximo de intentos alcanzado",
                  message: "Maximo de intentos alcanzado",
                };
              }
            }
          } catch (error) {
            return {
              code: 500,
              error: error,
              message: "Error al obtener el estado de la factura",
            };
          }
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
            code: JSON.parse(error).status,
            error: error,
            message: "Error al enviar la factura a emizor",
          };
        } catch (error) {
          return {
            code: 500,
            error: error,
            message: "Error al devolver el stock",
          };
        }
      }
    } else {
      return {
        code: 500,
        error: updatedStock,
        message:
          "Error al actualizar stock, algún producto no cuenta con la cantidad solicitada 1 ",
      };
    }
  } catch (error) {
    return {
      code: 500,
      error: error,
      message:
        "Error al actualizar stock, algún producto no cuenta con la cantidad solicitada 2",
    };
  }
};

const isValid = async () => {
  if (stateData === "VALIDA" || stateData === "RECHAZADA") {
    const autorizacion = `${body.emizor.extras.facturaTicket}$${data.ack_ticket}`;
    if (stateData === "VALIDA") {
      try {
        body.invoice.nroFactura = data.numeroFactura;
        body.invoice.cuf = data.cuf;
        body.invoice.autorizacion = autorizacion;
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
            try {
              const updatedLogs = await updateLogStockDetails(
                `NVAG-${ventaCreada.idCreado}`,
                idsCreados
              );
              return {
                code: 200,
                data: invoiceResponse,
                leyenda: JSON.parse(invoiceResponse).leyenda.descripcion,
                message: "Factura correcta",
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
      } catch (err) {
        return {
          code: 500,
          error: err,
          message: "Error en el proceso de facturacion",
        };
      }
    } else {
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
          error: "Factura rechazada",
          message: "Factura rechazada, intente nuevamente",
        };
      } catch (error) {
        return {
          code: 500,
          error: error,
          message: "Error al devolver el stock",
        };
      }
    }
  }
  if (maxRetries === retries) {
    return {
      code: 500,
      error: "Maximo de intentos alcanzado",
      message: "Maximo de intentos alcanzado",
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
