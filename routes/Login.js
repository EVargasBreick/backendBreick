const express = require("express");
const router = express.Router();

const controller = require("../controllers/login_controller");

router.get("/login", controller.loginUser);
module.exports = router;
