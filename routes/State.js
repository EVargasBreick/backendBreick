const express = require("express");
const router = express.Router();

const controller = require("../controllers/state_controller");

router.get("/departamentos", controller.getDepartamenos);
module.exports = router;
