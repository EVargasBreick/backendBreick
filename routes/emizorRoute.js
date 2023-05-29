const express = require("express");
const router = express.Router();
const controller = require("../controllers/emizor_controller");
const middleware = require("../services/isAuthEmizor");
//router.post("/facturas/enviar", controller.sendInvoiceEmizor);
router.post("/emizor/oauth/token", controller.postOauthToken);
router.delete("/api/v1/facturas/:cuf_ackTicket_uniqueCode/anular", controller.deleteAnularFactura);

module.exports = router;
