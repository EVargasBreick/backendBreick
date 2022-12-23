const express = require("express");
const router = express.Router();

const controller = require("../controllers/saleController");

router.post("/venta", controller.createNewSale);

module.exports = router;
