const express = require("express");
const router = express.Router();

const controller = require("../controllers/sale_controller");

router.post("/venta", controller.createNewSale);

module.exports = router;
