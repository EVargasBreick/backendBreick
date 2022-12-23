const express = require("express");
const router = express.Router();

const controller = require("../controllers/invoiceController");

router.post("/factura", controller.createNewInvoice);
router.delete("/factura", controller.deleteInvoice);

module.exports = router;
