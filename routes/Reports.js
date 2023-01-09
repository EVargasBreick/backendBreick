const express = require("express");
const router = express.Router();

const controller = require("../controllers/reportsController");

router.get("/reportes/ventas/general", controller.generalSalesReport);
router.get("/reportes/ventas/productos", controller.productSalesReport);
module.exports = router;
