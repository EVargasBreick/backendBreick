
const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const logger = require("../logger-pino");
const { client, pool } = require("../postgressConn");
const dateString = require("../services/dateServices");
const { default: axios } = require("axios");
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

            logger.info(
                `ESTADO DE LA FACTURA ${JSON.stringify(estadoFactura)}`
            );

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

                    logger.info(`REINTENTO ${retries}`);
                    logger.info(`ESTADO DE LA FACTURA ${JSON.stringify(estadoFactura)}`);

                } catch (error) {
                    logger.error(JSON.stringify(error));
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
        const invoiceQuery = `
        insert into Facturas (
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
        ) values (
            '${body.invoice.nroFactura}',
            ${body.invoice.idSucursal},
            '${body.invoice.nitEmpresa}',
            '${body.invoice.fechaHora}',
            '${body.invoice.nitCliente}',
            '${body.invoice.razonSocial}',
            ${body.invoice.tipoPago},
            ${body.invoice.pagado},
            ${body.invoice.cambio},
            '${body.invoice.nroTarjeta}',
            '${body.invoice.cuf}',
            '${body.invoice.aPagar}',
            '${body.invoice.importeBase}',
            '${body.invoice.debitoFiscal}',
             '${body.invoice.desembolsada}',
             '${body.invoice.autorizacion}',
             '${body.invoice.cufd}',
             '${body.invoice.fechaEmision}',
             ${body.invoice.nroTransaccion},
             '-',
             ${body.invoice.idOtroPago},
             ${body.invoice.vale},
             ${body.invoice.puntoDeVenta},
             '${body.invoice.idAgencia}',
             ${body.invoice.voucher},
             ${body.invoice.pya ? 1 : 0}
        ) returning "idFactura"`;

        const added = await clientTemp.query(invoiceQuery);
        console.log("Se llegooo", added.rows[0].idFactura);


        const invoiceCreated = added.rows[0].idFactura
        logger.info(
            `Invoice created ${invoiceCreated}`
        );
        return invoiceCreated
    }
    catch (error) {
        console.log('Error', error);
        throw 'Error al insertar la factura';
    }
}

const registerSalePos = async (data, idFactura, clientTemp) => {
    console.log("Ventas", data, idFactura);
    const idPedido = data.pedido.idPedido != "" ? data.pedido.idPedido : 0;
    const query = `insert into Ventas 
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
        ) values (
            ${data.pedido.idUsuarioCrea},
            ${data.pedido.idCliente},
            '${data.pedido.fechaCrea}',
            '${data.pedido.fechaActualizacion}',
            '${data.pedido.montoTotal}',
            '${data.pedido.descCalculado}',
            '${data.pedido.descuento}',
            '${data.pedido.montoFacturar}',
            '${idPedido}',
            '${idFactura ? idFactura : data.pedido.idFactura}'
        ) returning "idVenta"`;
    console.log("Creacion pedido query", query);

    try {
        const newOrder = await clientTemp.query(query);
        const idCreado = newOrder.rows[0].idVenta;
        data.productos.map(async (producto) => {
            const totalProducto =
                producto.total != undefined ? producto.total : producto.totalProd;
            var queryProds = `insert into Venta_Productos
                (
                   "idVenta", 
                    "idProducto", 
                    "cantidadProducto", 
                    "totalProd",
                    "descuentoProducto",
                    "precio_producto"
                ) values (
                    ${idCreado},
                    ${producto.idProducto},
                    '${producto.cantProducto}',
                    ${totalProducto},
                    ${producto.descuentoProd},
                    ${Number(producto.precioDeFabrica)}
                )`;
            console.log("Insertando productos", queryProds);
            const prods = await clientTemp.query(queryProds);

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
        const invoiceResponse = await insertFactura(body, clientTemp);
        body.venta.idFactura = invoiceResponse
        console.log("Body de la venta", body.venta);


        const saleCreated = await registerSalePos(
            body.venta,
            invoiceResponse,
            clientTemp
        );
        console.log("Sale created", JSON.parse(saleCreated));
        const ventaCreada = JSON.parse(saleCreated);
        logger.info(
            `Sale created ${JSON.stringify(ventaCreada)}`
        );
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
const createInvoicePostWithRetry = async (body, idsCreados, data, selectedLegend, maxRetries = 4) => {
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

        logger.info(`Stock body ${JSON.stringify(stockBody)}`);

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

            logger.info(`
                Estado de la factura no emmision type,
                ${stateData}`);

            const autorizacion = `${body.emizor.extras.facturaTicket}$${data.ack_ticket}`;
            logger.info(`Resp de la factura, ${JSON.stringify(data)}`);
            body.invoice.nroFactura = data.numeroFactura;
            body.invoice.cuf = data.cuf;
            body.invoice.autorizacion = autorizacion;
            body.invoice.cufd = data.shortLink;
            body.invoice.fechaEmision = data.fechaEmision;

            const responseFinal = await createInvoicePostWithRetry(body, idsCreados, data, selectedLegend);
            return responseFinal;
        }
    } catch (error) {
        console.log("Error", error);
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