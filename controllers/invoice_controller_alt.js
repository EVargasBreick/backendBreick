
const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const logger = require("../logger-pino");
const { client, pool } = require("../postgressConn");
const dateString = require("../services/dateServices");
const { default: axios } = require("axios");
const { toFixedDecimals } = require("../services/toFixedDecimals");
const { formatError } = require("../services/formatError");
const app = express();

app.use(session(sessionParams));

const TiposStock = Object.freeze({
    AGENCIA: {
        identificador: "AG",
        idName: "idAgencia",
        tableName: "Stock_Agencia",
    },
    BODEGA: {
        identificador: "AL",
        idName: "idBodega",
        tableName: "Stock_Bodega",
    },
    MOVIL: {
        identificador: "-",
        idName: "idVehiculo",
        tableName: "Stock_Agencia_Movil",
    },
});

const url =
    process.env.TYPE == "local"
        ? process.env.TESTEMIZOR_URL
        : process.env.EMIZOR_URL;

const updateStockQuery = (typeStock, operator, prod, dateResult, stockBody) => `
        UPDATE ${typeStock.tableName}
          SET "cant_Anterior" = "cant_Actual",
              "diferencia" = ${prod.cantProducto},
              "cant_Actual" = "cant_Actual" ${operator} ${prod.cantProducto},
              "fechaActualizacion" = '${dateResult}'
          WHERE "idProducto" = ${prod.idProducto} AND "${typeStock.idName}" = '${stockBody.idAlmacen}'
      `;


const logQueryFunction = (prod, stockBody, dateResult, operator) => `
      INSERT INTO log_stock_change ("idProducto", "cantidadProducto", "idAgencia", "fechaHora", "accion", "detalle")
      VALUES (${prod.idProducto}, ${prod.cantProducto}, '${stockBody.idAlmacen}', '${dateResult}', '${operator}', '${stockBody.detalle}')
      returning "idStockChange"
    `;

const getLeyendas = async (req) => {
    try {
        const urlLyenda = url + `/api/v1/parametricas/leyendas`;
        const authHeader = req.headers.authorization;
        const responseLeyenda = await axios.get(urlLyenda, {
            headers: {
                Authorization: authHeader,
            },
        });

        console.log('Response Leyenda', responseLeyenda.data)

        const random = Math.floor(Math.random() * (responseLeyenda.data.data.length - 1 + 1));
        const selectedLegend = responseLeyenda.data.data[random];
        console.log('Selected Legend', selectedLegend)

        return selectedLegend
    }
    catch (error) {
        console.log('Error', error)
        throw 'Error al obtener las leyendas'
    }
}


const postFacturaEmizor = async (body, req) => {
    try {
        const urlCompraVenta =
            url +
            `/api/v1/sucursales/${body.storeInfo.nroSucursal}/facturas/compra-venta`;
        const authHeader = req.headers.authorization;

        const invoiceResponse = await axios.post(urlCompraVenta, body.emizor, {
            headers: {
                Authorization: authHeader,
            },
        });

        console.log('InvoiceResponse', invoiceResponse.data)

        const data = invoiceResponse.data.data;
        return data
    }
    catch (error) {
        console.log('Error', error)
        if (error.response.data.data.errors) {
            console.log('Error response', error.response.data)
            throw error.response.data.data.errors;
        }
        throw 'Error al crear la factura'
    }
}

const getEstadoFactura = async (req, ackTicket) => {
    try {
        const urlsEstado = url + `/api/v1/facturas/${ackTicket}/status`;
        const authHeader = req.headers.authorization;

        let estadoFactura;
        let retries = 0;

        do {
            const responseEstado = await axios.get(urlsEstado, {
                headers: {
                    Authorization: authHeader,
                },
            });

            estadoFactura = responseEstado.data;
            console.log('response Estado', estadoFactura);

            if (estadoFactura.data.estado === "EN PROCESO") {
                try {
                    const delay = (ms) =>
                        new Promise((resolve) => setTimeout(resolve, ms));

                    await delay(3000);

                    const responseEstado = await axios.get(urlsEstado, {
                        headers: {
                            Authorization: authHeader,
                        },
                    });
                    estadoFactura = responseEstado.data;
                } catch (error) {
                    logger.error('GetEstadoFactura: ' + formatError(error));
                }
                retries++;
            }
        } while (estadoFactura.data.estado === "EN PROCESO" && retries < 150);

        return estadoFactura;
    } catch (error) {
        console.log('Error', error);
        throw 'Error al obtener el estado de la factura';
    }
};

const insertFactura = async (body, clientTemp) => {
    try {
        const { nroFactura, idSucursal, nitEmpresa, fechaHora, nitCliente, razonSocial, tipoPago, pagado, cambio, nroTarjeta, cuf, aPagar, importeBase, debitoFiscal, desembolsada, autorizacion, cufd, fechaEmision, nroTransaccion, idOtroPago, vale, puntoDeVenta, idAgencia, voucher, pya } = body;

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
            '-',
            idOtroPago,
            vale,
            puntoDeVenta,
            idAgencia,
            voucher,
            pya ? 1 : 0
        ];

        console.log("Query values", queryValues, queryValues.length);
        console.log("Body values", body);

        const added = await clientTemp.query(invoiceQuery, queryValues);
        console.log("Se llegooo", added.rows[0].idFactura);


        const invoiceCreated = added.rows[0].idFactura
        return invoiceCreated
    }
    catch (error) {
        console.log('Error', error);
        throw 'Error al insertar la factura';
    }
}

const registerSalePos = async (data, idFactura, clientTemp) => {
    console.log("Ventas", data, idFactura);
    const {
        idUsuarioCrea,
        idCliente,
        fechaCrea,
        fechaActualizacion,
        montoTotal,
        descCalculado,
        descuento,
        montoFacturar,
        idFactura: idFacturaPedido,
        idPedido: idPedidoData,
    } = data.pedido;

    const idPedido = idPedidoData != "" ? idPedidoData : 0;
    const queryAlt = `
      INSERT INTO Ventas 
      (
          "idUsuarioCrea",
          "idCliente",
          "fechaCrea",
          "fechaActualizacion",
          "montoTotal",
          "descuentoCalculado",
          descuento,
          "montoFacturar",
          "idPedido",
          "idFactura"
      ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING "idVenta";
    `;

    const values = [
        idUsuarioCrea,
        idCliente,
        fechaCrea,
        fechaActualizacion,
        toFixedDecimals(montoTotal),
        toFixedDecimals(descCalculado),
        descuento,
        toFixedDecimals(montoFacturar),
        idPedido,
        idFactura ? idFactura : idFacturaPedido,
    ];

    try {
        const newOrder = await clientTemp.query(queryAlt, values);
        const idCreado = newOrder.rows[0].idVenta;
        data.productos.map(async (producto) => {

            const { idProducto, precioDeFabrica, descuentoProd, total, totalProd, cantProducto } = producto
            const totalProducto =
                total != undefined ? total : totalProd;

            const queryProdsAlt = `
                INSERT INTO Venta_Productos
                (
                   "idVenta", 
                    "idProducto", 
                    "cantidadProducto", 
                    "totalProd",
                    "descuentoProducto",
                    "precio_producto"
                ) VALUES (
                    $1, $2, $3, $4, $5, $6
                );
              `;

            const valuesProds = [
                idCreado,
                idProducto,
                cantProducto,
                toFixedDecimals(totalProducto),
                toFixedDecimals(descuentoProd),
                toFixedDecimals(precioDeFabrica),
            ];

            console.log("Insertando productos", queryProdsAlt);
            const prods = await clientTemp.query(queryProdsAlt, valuesProds);

        });
        return JSON.stringify({
            code: 201,
            idCreado: idCreado,
            data: {
                idCreado: idCreado,
            },
        });

    } catch (err) {
        throw 'Error al insertar a ventas'
    }

}

const updateLogStockDetails = async (detalle, idsCreados, clientTemp) => {
    if (idsCreados > 0) {
        console.log("Ids creados", idsCreados);
        const queryArray = [];
        for (const id of idsCreados) {
            const updateQuery = `update log_stock_change set detalle='${detalle}' where "idStockChange"=${id}`;
            console.log("Updateando stock query log", updateQuery);
            queryArray.push(updateQuery);
        }
        try {
            await Promise.all(queryArray.map((q) => clientTemp.query(q)));
            return {
                data: [],
                code: 200,
            };
        } catch (err) {
            return {
                error: err.message || err,
                code: 500,
            };
        }
    } else {
        return {
            data: [],
            code: 200,
        };
    }
}

const createInvoicePost = async (body, idsCreados, data, selectedLegend) => {
    const clientTemp = await pool.connect();
    try {
        await clientTemp.query("BEGIN");
        const invoiceResponse = await insertFactura(body.invoice, clientTemp);
        body.venta.idFactura = invoiceResponse
        console.log("Body de la venta", body.venta);


        const saleCreated = await registerSalePos(
            body.venta,
            invoiceResponse,
            clientTemp
        );
        console.log("Sale created", JSON.parse(saleCreated));
        const ventaCreada = JSON.parse(saleCreated);
        const updatedLogs = await updateLogStockDetails(
            `NVAG-${ventaCreada.idCreado}`,
            idsCreados,
            clientTemp
        );
        console.log("Updated logs", updatedLogs);

        await clientTemp.query("COMMIT");
        return {
            code: 200,
            data: JSON.stringify({
                code: 200,
                data: { data: data },
            }),
            leyenda: selectedLegend.descripcion,
            message: "Factura correcta",
        }
    }
    catch (error) {
        await clientTemp.query("ROLLBACK");
        console.log('Error', error);
        throw 'Error al subir la factura a breick, pero se creo en emizor';
    }
    finally {
        clientTemp.release();
    }
}
const createInvoicePostWithRetry = async (body, idsCreados, data, selectedLegend, maxRetries = 150) => {
    let retryCount = 0;
    while (retryCount < maxRetries) {
        try {
            const result = await createInvoicePost(body, idsCreados, data, selectedLegend, client);
            return result;
        } catch (error) {
            console.error(`Error on attempt ${retryCount + 1}:`, error);
            retryCount++;
        }
    }

    throw 'AVISAR A SISTEMAS, Error al subir la factura a breick, pero se creo en emizor, volver a intentar';
}


const createInvoiceAltPlus = async (body, req) => {

    let data
    let stateData
    let idsCreados
    let selectedLegend

    try {
        await client.query("BEGIN");

        const stockBody = {
            accion: "take",
            idAlmacen: body.stock.idAlmacen,
            productos: body.stock.productos,
            detalle: `NVAG-0`,
        };

        const dateResult = dateString();

        const operator = stockBody.accion === "add" ? "+" : "-";
        const typeStock = stockBody.idAlmacen.includes(TiposStock.AGENCIA.identificador)
            ? TiposStock.AGENCIA
            : stockBody.idAlmacen.includes(TiposStock.BODEGA.identificador)
                ? TiposStock.BODEGA
                : TiposStock.MOVIL;

        const queries = [];

        console.log("typeStock", typeStock);

        for (const prod of stockBody.productos) {
            queries.push(updateStockQuery(typeStock, operator, prod, dateResult, stockBody));
            queries.push(logQueryFunction(prod, stockBody, dateResult, operator));
        }


        console.log("Queries", queries);

        const resultArray = await Promise.all(
            queries.map((q) => client.query(q))
        );


        const filtered = resultArray.filter(
            (result) => result.command === "INSERT"
        );
        const arrayIds = [];

        for (const filt of filtered) {
            console.log("Valueee", filt.rows);
            arrayIds.push(filt.rows[0].idStockChange);
        }

        console.log("Array ids", arrayIds);

        idsCreados = arrayIds;

        // Create invoice
        logger.info(`Body de la factura ${JSON.stringify(body)}`);

        selectedLegend = await getLeyendas(req, client);
        body.emizor.codigoLeyenda = selectedLegend.codigo;

        // NOTE: mas importante
        data = await postFacturaEmizor(body, req)
        const responseEstadoFactura = await getEstadoFactura(req, data.ack_ticket)
        stateData = responseEstadoFactura.data.estado;

        if (Number(data.emission_type_code) === 1) {
            if (stateData !== "VALIDA") {
                throw 'Error al procesar la factura, intente de nuevo'
            }

        } else {
            if (stateData !== "VALIDA" && stateData !== "PENDIENTE") {
                throw 'Error al procesar la factura, intente de nuevo'
            }
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        console.log('Error', error);
        return {
            code: 500,
            error: error,
            message:
                typeof error === "string" ? error : "Error al crear la factura, intente nuevamente",
        };
    }

    try {
        if (Number(data.emission_type_code) === 1) {


            const autorizacion = `${body.emizor.extras.facturaTicket}$${data.ack_ticket}`;
            logger.info(`Autorizacion test ${autorizacion}`);
            logger.info(`Resp de la factura ${JSON.stringify(data)}`);
            body.invoice.nroFactura = data.numeroFactura;
            body.invoice.cuf = data.cuf;
            body.invoice.autorizacion = autorizacion;
            body.invoice.cufd = data.shortLink;
            body.invoice.fechaEmision = data.fechaEmision;

            const responseFinal = await createInvoicePostWithRetry(body, idsCreados, data, selectedLegend);
            return responseFinal;
        } else {
            logger.warn("Is not online invoice");

            const responseEstadoFactura = await getEstadoFactura(req, data.ack_ticket)
            const stateData = responseEstadoFactura.data.estado;

            const autorizacion = `${body.emizor.extras.facturaTicket}$${data.ack_ticket}`;
            body.invoice.nroFactura = data.numeroFactura;
            body.invoice.cuf = data.cuf;
            body.invoice.autorizacion = autorizacion;
            body.invoice.cufd = data.shortLink;
            body.invoice.fechaEmision = data.fechaEmision;

            const responseFinal = await createInvoicePostWithRetry(body, idsCreados, data, selectedLegend);
            return responseFinal;
        }
    } catch (error) {
        logger.error('CreateInvoiceAltPlus:', formatError(error));
        return {
            code: 500,
            error: error,
            message:
                typeof error === "string" ? error : "Error al crear la factura, intente nuevamente",
        };
    }
};

module.exports = {
    createInvoiceAltPlus,
};