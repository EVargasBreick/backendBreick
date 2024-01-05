const express = require("express");
const router = express.Router();

const controller = require("../controllers/composed_controllers");

router.post("/emizor/facturar", controller.invoiceProcess);
router.post("/virtual/facturar", controller.recordInvoiceProcess);
router.post("/online/facturar", controller.onlineInvoiceProcess);
router.post("/compuesto/traspaso", controller.composeTransferProcess);
router.post("/compuesto/order", controller.composedOrderProcess);
router.post("/compuesto/baja", controller.composeDropProcess);
router.put("/compuesto/pedido/cancelar", controller.composedCancelOrderProcess);
router.put("/compuesto/ingreso/productos", controller.composedProductEntry);
router.put("/compuesto/traspaso/aceptar", controller.composedAcceptTramsfer);
module.exports = router;
