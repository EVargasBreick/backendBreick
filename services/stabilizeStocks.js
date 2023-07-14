/*const { Client } = require("pg");
const sourceDb = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "1123581321",
  database: "source",
});

const destination = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "1123581321",
  database: "DB_BREICKREST",
});

sourceDb.connect();
destination.connect();

const updateInvoices = async () => {
  const query = `
   select * from Facturas fc inner join ventas vn on vn."idFactura"=fc."idFactura"
   inner join venta_productos vp on vp."idVenta"=vn."idVenta"
   where to_date(fc."fechaHora",'DD/MM/YYYY')> to_date('11/07/2023', 'DD/MM/YYYY')`;
  try {
    const list = await sourceDb.query(query);
    const data = list.rows;
    const filteredIds = Array.from(new Set(data.map((item) => item.idFactura)));
    const processed = processedData(filteredIds, data);
    processed.then(async (arr) => {
      for (const item of arr) {
        const body = item.invoice;
        const queryInvoice = `
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
            '${body.estado}',
            '${body.importeBase}',
            '${body.debitoFiscal}',
             '${body.desembolsada}',
             '${body.autorizacion}',
             '${body.cufd}',
             '${body.fechaEmision}',
             ${body.nroTransaccion},
             '-',
             ${body.idOtroPago},
             ${body.vale},
             ${body.puntoDeVenta},
             '${body.idAgencia}',
             ${body.voucher},
             ${body.pya ? 1 : 0}
        ) returning "idFactura"`;
        console.log("Query", queryInvoice);
        try {
          const idFactura = await regInvoice(queryInvoice);
          console.log("IdFactura");
          const queryVenta = `insert into Ventas 
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
              ${body.idUsuarioCrea},
              ${body.idCliente},
              '${body.fechaCrea}',
              '${body.fechaActualizacion}',
              '${body.montoTotal}',
              '${body.descuentoCalculado}',
              '${body.descuento}',
              '${body.montoFacturar}',
              0,
              '${idFactura}'
          ) returning "idVenta"`;
          try {
            const idVenta = await regSale(queryVenta);
            for (const prod of item.products) {
              const queryProd = `insert into Venta_Productos
              (
                 "idVenta", 
                  "idProducto", 
                  "cantidadProducto", 
                  "totalProd",
                  "descuentoProducto"
              ) values (
                  ${idVenta},
                  ${prod.idProducto},
                  ${prod.cantidadProducto},
                  ${prod.totalProd},
                  ${prod.descuentoProducto}
              )`;
              console.log("Products added", queryProd);
              try {
                const productAdded = await regProds(queryProd);
                console.log("Product correctly added");
              } catch (err) {
                console.log("FLAG VP");
              }
            }
          } catch {
            console.log("FLAG VP");
          }
        } catch (err) {
          console.log("Error al guardar venta", err);
        }
      }
    });
  } catch (err) {
    console.log("Error al guardar factura", err);
  }
};

function processedData(filteredIds, data) {
  return new Promise((resolve) => {
    const arr = [];
    for (const dt of filteredIds) {
      const obj = {
        id: dt,
        invoice: data.find((found) => found.idFactura == dt),
        products: data.filter((ft) => ft.idFactura == dt),
      };
      arr.push(obj);
    }
    resolve(arr);
  });
}

function regInvoice(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const created = await destination.query(query);
      const idFactura = created.rows[0].idFactura;
      resolve(idFactura);
    } catch (err) {
      reject(err);
    }
  });
}

function regSale(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const created = await destination.query(query);
      const idVenta = created.rows[0].idVenta;
      resolve(idVenta);
    } catch (err) {
      reject(err);
    }
  });
}

function regProds(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const created = await destination.query(query);
      resolve(created);
    } catch (err) {
      reject(err);
    }
  });
}
*/
