const express = require("express");
const router = express.Router();

const controller = require("../controllers/stateController");

router.get("/departamentos", controller.getDepartamenos);
module.exports = router;
