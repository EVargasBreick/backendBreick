const express = require("express");
const router = express.Router();

const controller = require("../controllers/storeController");

router.get("/agencias", controller.getStores);
router.get("/stockUsuario", controller.getUserStock);
router.get("/stock/disponible", controller.getProductAvailability);
router.put("/stock/update", controller.updateProductStock);
module.exports = router;
