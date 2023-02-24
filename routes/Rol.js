const express = require("express");
const router = express.Router();

const controller = require("../controllers/rol_controller");

router.get("/roles", controller.getRoles);
module.exports = router;
