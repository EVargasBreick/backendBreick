const express = require("express");
const router = express.Router();

const controller = require("../controllers/nodeMailerController");

router.post("/correo", controller.sendOrderGmail);
module.exports = router;
