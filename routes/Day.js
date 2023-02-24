const express = require("express");
const router = express.Router();

const controller = require("../controllers/day_controller");
router.get("/dias", controller.getDias);
module.exports = router;
