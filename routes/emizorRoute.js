const express = require("express");
const router = express.Router();
const controller = require("../controllers/emizor_controller");
const middlewareEmizor = require("../services/isAuthEmizor");
//router.post("/facturas/enviar", controller.sendInvoiceEmizor);
router.post("/emizor/oauth/token", controller.postOauthToken);
router.delete("/emizor/api/v1/facturas/:cuf_ackTicket_uniqueCode/anular", middlewareEmizor, controller.deleteAnularFactura);
router.get("/emizor/api/v1/puntos-de-venta", middlewareEmizor, controller.getPuntosVenta);

module.exports = router;
