const express = require("express");
const router = express.Router();

const controller = require("../controllers/discount_controller");
router.get("/descuentos/temporada", controller.getSeasonDiscounts);
router.get("/descuentos/verificar", controller.getCurrentSeason);
router.post("/descuentos/registrar", controller.registerSeasonal);
router.put("/descuentos/temporada/desactivar", controller.disabledSeasonal);
router.get("/descuentos/tipo", controller.discountType);
module.exports = router;
