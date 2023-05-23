const express = require("express");
const router = express.Router();

const controller = require("../controllers/emizor_controller");
router.post("/facturar", controller.sendInvoiceEmizor);
module.exports = router;
