const express = require("express");
const router = express.Router();

const controller = require("../controllers/composed_controllers");

router.post("/emizor/facturar", controller.invoiceProcess);

module.exports = router;
