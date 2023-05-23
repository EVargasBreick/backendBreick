const { default: axios } = require("axios");

const createInvoiceEmizor = (body) => {
  const productos = [];
  for (const product of body.productos) {
    const detalle = {
      codigoProducto: product.codInterno,
      codigoActividadSin: product.actividadEconomica,
      codigoProductoSin: product.codigoSin,
      descripcion: product.nombreProducto,
      unidadMedida: product.unidadDeMedida,
      precioUnitario: product.precioDeFabrica,
      subTotal: product.subTotal,
      cantidad: product.cantProducto,
      numeroSerie: "",
      montoDescuento: product.descProducto,
      numeroImei: "",
    };
    productos.push(detalle);
  }
  const bodyData = {
    numeroFactura: body.nroFactura,
    nombreRazonSocial: body.razonSocial,
    codigoPuntoVenta: body.puntoDeVenta,
    fechaEmision: body.fechaEmision,
    cafc: body.cafc,
    codigoExcepcion: true,
    descuentoAdicional: body.descuentoCalculado,
    montoGiftCard: body.giftCard,
    codigoTipoDocumentoIdentidad: body.tipoDocumento,
    numeroDocumento: body.ci,
    complemento: body.complemento,
    codigoCliente: body.idCliente,
    codigoMetodoPago: body.tipoPago,
    numeroTarjeta: body.nroTarjeta,
    montoTotal: body.montoFacturar,
    codigoMoneda: body.codigoMoneda,
    montoTotalMoneda: body.montoTotalMoneda,
    usuario: body.usuario,
    emailCliente: body.emailCliente,
    telefonoCliente: body.telCliente,
    extras: {
      uniqueCode: "",
    },
    codigoLeyenda: 0,
    montoTotalSujetoIva: body.montoTotal,
    tipoCambio: body.tipoCambio,
    detalles: productos,
  };
  console.log("Datos para enviar a la factura", bodyData);
  return new Promise(async (resolve, reject) => {
    try {
      const sendedInvoice = await axios.post(`url`, body);
      resolve(sendedInvoice);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { createInvoiceEmizor };
