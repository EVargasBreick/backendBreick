const express = require("express");
const router = express.Router();

const controller = require("../controllers/node_mailer_controller");

router.post("/correo", controller.sendOrderGmail);
module.exports = router;
