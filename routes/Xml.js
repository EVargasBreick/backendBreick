const express = require("express");
const router = express.Router();
const controller = require("../controllers/xmlController");
router.post("/xml/login", controller.xmlLogin);
router.post("/xml/ultimoComprobante", controller.getLastId);
router.post("/xml/aprobarComprobante", controller.authorizeInvoice);
router.post("/xml/salidaTransaccion", controller.invoiceOut);
router.post("/xml/cancelarComprobante", controller.cancelInvoice);
module.exports = router;
