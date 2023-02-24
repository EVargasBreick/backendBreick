const express = require("express");
const router = express.Router();

const controller = require("../controllers/shortage_controller");

router.post("/faltantes", controller.logShortage);

module.exports = router;
