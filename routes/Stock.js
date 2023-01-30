const express = require("express");
const router = express.Router();

const controller = require("../controllers/stockController");
router.get("/log/stock/agencia", controller.stockFromDateAndStore);
router.get("/log/stock/producto", controller.stockFromDateAndProduct);
router.get("/actual/stock/agencia", controller.currentStoreStock);
router.get("/actual/stock/producto", controller.currentProductStock);
router.put("/stock/inicializar", controller.initializeStock);
module.exports = router;
