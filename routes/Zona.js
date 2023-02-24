const express = require("express");
const router = express.Router();
const controller = require("../controllers/zone_controller");
router.get("/zonas", controller.getZonas);
module.exports = router;
