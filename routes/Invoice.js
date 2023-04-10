const express = require("express");
const router = express.Router();

const controller = require("../controllers/invoice_controller");

router.post("/factura", controller.createNewInvoice);
router.delete("/factura", controller.deleteInvoice);
router.get("/facturas/lista", controller.getInvoices);
router.put("/facturas/anular", controller.cancelInvoice);
router.put("/facturas", controller.updateInvoice);
router.get("/pagos/otros", controller.otherPayments);
router.post("/facturas/log", controller.logIncomplete);

module.exports = router;
