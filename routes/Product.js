const express = require("express");
const router = express.Router();

const controller = require("../controllers/product_controller");

router.get("/productos", controller.findProduct);
router.get("/productos/count", controller.numberOfProducts);
router.get("/productos/disponible", controller.getAvailableProduct);
router.get("/productos/stock", controller.productsWithStock);
router.get("/productos/descuentos", controller.productsDiscount);
router.post("/productos/nuevo", controller.createProduct);
router.get("/productos/codigos", controller.getCodes);
router.get("/productos/tipos", controller.getProdTypes);
router.get("/productos/origen", controller.getProdOrigin);
router.get("/productos/all", controller.geAllProducts);
router.put("/productos/editar/:id", controller.updateProduct);
module.exports = router;
