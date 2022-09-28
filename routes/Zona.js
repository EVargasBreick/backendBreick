const express = require("express");
const router = express.Router();
const controller = require("../controllers/zoneController");
router.get("/zonas", controller.getZonas);
module.exports = router;
