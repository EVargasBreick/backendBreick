const express = require("express");
const router = express.Router();

const controller = require("../controllers/shortageController");

router.post("/faltantes", controller.logShortage);

module.exports = router;
