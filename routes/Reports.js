const express = require("express");
const router = express.Router();

const controller = require("../controllers/reportsController");

router.get("/reportes/ventas/general", controller.generalSalesReport);
module.exports = router;
