const express = require("express");
const router = express.Router();

const controller = require("../controllers/store_controller");

router.get("/agencias", controller.getStores);
router.get("/agencias/solo", controller.getOnlyStores);
router.get("/stockUsuario", controller.getUserStock);
router.get("/stock/disponible", controller.getProductAvailability);
router.put("/stock/update", controller.updateProductStock);
router.put("/stock/full/update", controller.updateFulltStock);
router.get("/agencias/puntos", controller.getSalePoints);
router.get("/agencias/mobiles/puntos", controller.getMobileSalePoints);
router.get("/agencias/puntos/nombres", controller.getSalePointsAndStore);

module.exports = router;
