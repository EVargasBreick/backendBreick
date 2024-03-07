const fs = require("fs");
const XLSX = require("xlsx");
const { client } = require("../postgressConn");

async function readPastSales(fileName, store) {
  //console.log("Entro a la funcion");
  const workbook = XLSX.readFile(
    `C:/Users/Eric/OneDrive/Documentos/Reportes Ventas Pasados/${fileName}.xlsx`
  );
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

  // Filter out empty rows

  const filteredNull = rows.filter((row) =>
    row.some((cellValue) => cellValue !== null)
  );

  const headerRow = filteredNull[0];
  const dataRows = filteredNull.slice(1);
  const jsonData = convertToJSON(headerRow, dataRows);

  const uniqueArray = [];

  for (const entry of jsonData) {
    const found = uniqueArray.find(
      (ua) => ua.NumFac == entry.NumFac && ua.FechaFact == entry.FechaFact
    );
    if (!found) {
      uniqueArray.push(entry);
    }
  }
  try {
    for (const sale of uniqueArray) {
      const saleProducts = jsonData.filter(
        (jd) => jd.FechaFact == sale.FechaFact && jd.NumFac == sale.NumFac
      );
      const totalVenta = saleProducts.reduce((accumulator, object) => {
        return accumulator + Number(object.Total);
      }, 0);
      await client.query("BEGIN");
      const saleQuery = `insert into ventas_pasadas ("nroFactura","fecha","razonSocial","total", "idAgencia") values ('${
        sale.NumFac
      }','${sale.FechaFact.trim()}','${
        sale.Destinatario
      }',${totalVenta?.toFixed(2)}, '${store}') returning id_venta_pasada`;
      console.log("SALE QUERY", saleQuery);
      const saleCreated = await client.query(saleQuery);
      const createdId = saleCreated.rows[0].id_venta_pasada;
      for (const product of saleProducts) {
        const prodId = await client.query(
          `select "idProducto" from Productos where "codInterno"='${product.Codigo}'`
        );
        let id = prodId.rows.length === 1 ? prodId.rows[0].idProducto : 0;
        const productSaleQuery = `insert into prod_venta_pasada (id_venta_pasada, "idProducto", "codInterno","nombreProducto", "cantidadProducto", precio_producto, "totalProd")
            values (${createdId},${id},${product.Codigo},'${product.NombreProducto}',${product.Cant},${product.UNit},${product.Total})`;
        console.log("PROD QUERY", productSaleQuery);
        const inserted = await client.query(productSaleQuery);
      }
      await client.query("COMMIT");
    }
  } catch (error) {
    console.log("Error al insertar", error);
    await client.query("ROLLBACK");
  } finally {
    return true;
  }
}

function convertToJSON(headerRows, dataRows) {
  const jsonData = dataRows.map((row) => {
    const dataObject = {};
    headerRows.forEach((key, index) => {
      dataObject[key] = row[index];
    });
    return dataObject;
  });
  return jsonData;
}

async function mapThroughStores() {
  console.log("Entro aca");
  const storeArray = [
    { fileName: "2021 al 2023 Federico Suazo", storeId: "AG001" },
    { fileName: "2021 al 2023 Agencia San Miguel", storeId: "AG002" },
    { fileName: "2021 al 2023 Agencia Sopocachi", storeId: "AG003" },
    { fileName: "2021 al 2023 Agencia Miraflores", storeId: "AG004" },
    { fileName: "2021 al 2023 Almacen Santa Cruz", storeId: "AG005" },
    { fileName: "2021 al 2023 Agencia Cochabamba", storeId: "AG006" },
    { fileName: "2021 al 2023 Agencia Tarija", storeId: "AG007" },
    { fileName: "2021 al 2023 Cine Center LP", storeId: "AG008" },
    { fileName: "2021 al 2023 Cine Center SCZ", storeId: "AG009" },
    { fileName: "2021 al 2023 Agencia Sucre", storeId: "AG010" },
  ];
  /*


*/

  for (const store of storeArray) {
    console.log(`Entrando al archivo  ${store.fileName}`);
    await readPastSales(store.fileName, store.storeId);
    console.log(`Termino el proceso en el archivo ${store.fileName}`);
  }
}

async function readPastSalesAlt(fileName, store) {
  try {
    const workbook = XLSX.readFile(
      `C:/Users/Eric/OneDrive/Documentos/Reportes Ventas Pasados/${fileName}.xlsx`
    );

    const jsonData = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: true,
      });

      // Filter out empty rows
      const filteredNull = rows.filter((row) =>
        row.some((cellValue) => cellValue !== null)
      );

      const headerRow = filteredNull[0];
      const dataRows = filteredNull.slice(1);
      const sheetData = convertToJSON(headerRow, dataRows);
      jsonData.push(...sheetData);
    }

    const uniqueArray = [];

    for (const entry of jsonData) {
      const found = uniqueArray.find(
        (ua) =>
          ua["numero factura"] == entry["numero factura"] &&
          ua.fechaEmision == entry.fechaEmision
      );
      if (!found) {
        uniqueArray.push(entry);
      }
    }

    for (const sale of uniqueArray) {
      const saleProducts = jsonData.filter(
        (jd) =>
          jd.fechaEmision == sale.fechaEmision &&
          jd["numero factura"] == sale["numero factura"]
      );
      const totalVenta = saleProducts.reduce((accumulator, object) => {
        return accumulator + Number(object.precioTotal);
      }, 0);
      await client.query("BEGIN");

      const structuredDate = sale.fechaEmision.split("-").join("/");

      const saleQuery = `insert into ventas_pasadas ("nroFactura","fecha","razonSocial","total", "idAgencia") values ('${
        sale["numero factura"]
      }','${structuredDate.trim()}',$1,${totalVenta?.toFixed(
        2
      )}, '${store}') returning id_venta_pasada`;
      console.log("SALE QUERY", saleQuery);
      const saleCreated = await client.query(saleQuery, [sale["razon social"]]);
      const createdId = saleCreated.rows[0].id_venta_pasada;
      for (const product of saleProducts) {
        const prodId = await client.query(
          `select "idProducto" from Productos where "codInterno"='${product.cod_prod}'`
        );
        let id = prodId.rows.length === 1 ? prodId.rows[0].idProducto : 0;
        const productSaleQuery = `insert into prod_venta_pasada (id_venta_pasada, "idProducto", "codInterno","nombreProducto", "cantidadProducto", precio_producto, "totalProd")
            values (${createdId},${id},${product.cod_prod},'${product.nombre_producto}',${product.cantidad},${product.precioUnidad},${product.precioTotal})`;
        //console.log("PROD QUERY", productSaleQuery);
        const inserted = await client.query(productSaleQuery);
      }
      await client.query("COMMIT");
    }
    return true;
  } catch (error) {
    console.log("Error al insertar", error);
    await client.query("ROLLBACK");
    return false;
  }
}

module.exports = { mapThroughStores };
