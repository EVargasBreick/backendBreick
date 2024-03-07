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
router.get(
  "/reportes/agrupado/productos/vendedor",
  controller.groupedSalesProdSeller
);
router.get("/reportes/diario/vendedor", controller.salesByDay);
router.get("/reportes/diario/metas", controller.monthlyGoals);
router.get("/reportes/diario/restante", controller.remaingingDayGoal);
router.get("/reportes/muestras", controller.samplesReport);
router.get("/reportes/muestras/productos", controller.samplesProdReport);
router.get("/reportes/traspasos/productos", controller.transferProductsReport);
router.get("/reportes/traspasos/simple", controller.simpleTransferReport);
router.get("/reportes/descuentos/diario", controller.dailyDiscountReport);
router.get("/reportes/facturas/canceladas", controller.canceledInvoices);
router.get("/reportes/ventas/pasadas/producto", controller.pastSalesByProduct);
module.exports = router;
