const express = require("express");
const router = express.Router();

const controller = require("../controllers/stock_controller");
router.get("/log/stock/agencia", controller.stockFromDateAndStore);
router.get("/log/stock/producto", controller.stockFromDateAndProduct);
router.get("/actual/stock/agencia", controller.currentStoreStock);
router.get("/actual/stock/producto", controller.currentProductStock);
router.put("/stock/inicializar", controller.initializeStock);
router.post("/log/ingreso", controller.logEntry);
router.get("/log/ingreso", controller.getlogEntry);
module.exports = router;
