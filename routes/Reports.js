const express = require("express");
const router = express.Router();

const controller = require("../controllers/reports_controller");

router.get("/reportes/ventas/general", controller.generalSalesReport);
router.get("/reportes/ventas/productos", controller.productSalesReport);
router.get("/reportes/cierre", controller.closingDayReport);
router.get("/reportes/cierre/detalles/facturas", controller.firstAndLast);
router.get("/reportes/main", controller.mainReport);
router.get("/reportes/bajas/general", controller.markdownsReport);
module.exports = router;
