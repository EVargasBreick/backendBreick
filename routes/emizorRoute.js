const express = require("express");
const router = express.Router();
const controller = require("../controllers/emizor_controller");
const middlewareEmizor = require("../services/isAuthEmizor");
//router.post("/facturas/enviar", controller.sendInvoiceEmizor);
router.post("/emizor/oauth/token", controller.postOauthToken);
router.delete("/emizor/api/v1/facturas/:cuf_ackTicket_uniqueCode/anular/:motivo", middlewareEmizor, controller.deleteAnularFactura);
router.get("/emizor/api/v1/puntos-de-venta", middlewareEmizor, controller.getPuntosVenta);
router.get("/emizor/api/v1/parametros/leyendas", middlewareEmizor, controller.getCodigosLeyenda);
router.get("/emizor/facuradb/:uniqueCode", middlewareEmizor, controller.getFacturaDB); // * get factura from db
router.get("/emizor/facturasdb/:nit", middlewareEmizor, controller.getFacturasDB); // * get facturas from db
router.get("/emizor/facturas/:cuf", middlewareEmizor, controller.getFacturasEmizor); // * get factura from emizor

module.exports = router;
