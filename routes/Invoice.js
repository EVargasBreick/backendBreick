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
router.get("/facturas/incompletas", controller.getIncomplete);
router.get("/facturas/reimprimir", controller.rePrintInvoice);

module.exports = router;
