const express = require("express");
const router = express.Router();

const controller = require("../controllers/productController");

router.get("/productos", controller.findProduct);
module.exports = router;
