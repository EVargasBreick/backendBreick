const { getFacturasEmizor } = require("../models/emizor_model");
const { client } = require("../postgressConn");
const isInternalAuthEmizor = require("./internalAuth");
const logIncompleteSales = async () => {
  const listQuery = `select "idFactura", "fechaHora", "razonSocial", "nitCliente", cuf from Facturas where "idFactura" not in (select "idFactura" from Ventas) and
    to_date("fechaHora", 'DD/MM/YYYY')>to_Date('06/06/2023', 'DD/MM/YYYY')
    order by cast("idFactura" as int) asc`;
  try {
    const invoiceList = await client.query(listQuery);
    console.log("Invoice list length", invoiceList.rows.length);
    for (const invoice of invoiceList.rows) {
      setTimeout(async () => {
        await processSales(invoice);
        console.log("Venta ingresada");
      }, 1000);
    }
  } catch (err) {
    console.log("Error al obtener las facturas", err);
  }
};

async function processSales(invoiceData) {
  return new Promise(async (resolve, reject) => {
    const auth = await isInternalAuthEmizor();
    const headers = {
      headers: {
        authorization: auth,
      },
    };
    try {
      const detalles = await getFacturasEmizor(invoiceData.cuf, headers);
      await registerLoggedSale(JSON.parse(detalles), invoiceData);
      resolve(true);
    } catch (err) {
      console.log("Error al obtener el estado", err);
      reject(false);
    }
  });
}

async function registerLoggedSale(saleData, invoiceData) {
  console.log("Invoice data", saleData.data.data);
  const data = saleData.data.data;
  return new Promise(async (resolve, reject) => {
    const saleQuery = `insert into ventas ("idUsuarioCrea", "idCliente","fechaCrea","fechaActualizacion",
        "montoTotal","descuentoCalculado","descuento", "montoFacturar","idPedido","idFactura") values
        ((select "idUsuario" from Usuarios where usuario='${data.usuario}'), 
        (select "idCliente" from Clientes where nit='${
          invoiceData.nitCliente
        }'), '${invoiceData.fechaHora}', 
        '${invoiceData.fechaHora}', ${
      parseFloat(data.montoTotal) + parseFloat(data.descuentoAdicional)
    },
        ${data.descuentoAdicional},0,${data.montoTotal},0,${
      invoiceData.idFactura
    })
        returning "idVenta"`;
    console.log("Query ingresando venta", saleQuery);

    try {
      const registeredSale = await client.query(saleQuery);
      const idVenta = registeredSale.rows[0].idVenta;
      let count = 0;
      for (const product of data.detalle) {
        await registerLoggedSProduct(product, idVenta);
        count++;
        console.log("Count", count, "length", data.detalle.length);
      }

      if (count === data.detalle.length) {
        resolve(true);
      }
    } catch (err) {
      console.log("Error al registrar la venta", err);
      reject(err);
    }
  });
}

async function registerLoggedSProduct(productData, idVenta) {
  return new Promise(async (resolve, reject) => {
    const prodQuery = `insert into venta_productos ("idVenta","idProducto","cantidadProducto","totalProd","descuentoProducto")
        values (${idVenta},
        (select "idProducto" from Productos where "codInterno"='${productData.codigoProducto}'),
        ${productData.cantidad},
        ${productData.subTotal},
        ${productData.montoDescuento}
        )`;
    try {
      console.log("Query Prod", prodQuery);
      const logged = await client.query(prodQuery);
      resolve(logged);
    } catch (err) {
      console.log("Error al registrar el producto", err);
      reject(err);
    }
  });
}

module.exports = { logIncompleteSales };
