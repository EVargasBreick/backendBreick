const express = require("express");
const router = express.Router();

const controller = require("../controllers/invoiceController");

router.post("/factura", controller.createNewInvoice);
router.delete("/factura", controller.deleteInvoice);
router.get("/facturas/lista", controller.getInvoices);
router.put("/facturas/anular", controller.cancelInvoice);

module.exports = router;
