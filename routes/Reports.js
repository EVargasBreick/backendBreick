const express = require("express");
const router = express.Router();

const controller = require("../controllers/reports_controller");

router.get("/reportes/ventas/general", controller.generalSalesReport);
router.get("/reportes/ventas/productos", controller.productSalesReport);
router.get("/reportes/cierre", controller.closingDayReport);
router.get("/reportes/cierre/detalles/facturas", controller.firstAndLast);
router.get("/reportes/main", controller.mainReport);
router.get("/reportes/bajas/general", controller.markdownsReport);
router.get(
  "/reportes/productos/pedidos",
  controller.orderGroupedProductsReport
);
router.get("/reportes/totales/agencia", controller.salesByStoreReport);
router.get("/reportes/totales/vendedor", controller.salesBySalespersonReport);
router.get("/reportes/stock/virtual", controller.virtualStockReport);
router.get("/reportes/traspasos/agencia", controller.traspasosAgenciasReport);
router.get("/reportes/agrupado/productos", controller.groupedProdReport);
module.exports = router;
