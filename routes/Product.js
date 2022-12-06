const express = require("express");
const router = express.Router();

const controller = require("../controllers/productController");

router.get("/productos", controller.findProduct);
router.get("/productos/count", controller.numberOfProducts);
router.get("/productos/disponible", controller.getAvailableProduct);
router.get("/productos/stock", controller.productsWithStock);
router.get("/productos/descuentos", controller.productsDiscount);
module.exports = router;
