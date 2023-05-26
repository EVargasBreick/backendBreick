const express = require("express");
const router = express.Router();

const controller = require("../controllers/emizor_controller");
router.post("/facturas/enviar", controller.sendInvoiceEmizor);
router.post("/emizor/oauth/token", controller.postOauthToken);
module.exports = router;
