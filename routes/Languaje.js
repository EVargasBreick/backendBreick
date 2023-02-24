const express = require("express");
const router = express.Router();

const controller = require("../controllers/languaje_controller");
router.get("/language", controller.getLanguajes);
module.exports = router;
