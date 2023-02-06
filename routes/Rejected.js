const express = require("express");
const router = express.Router();

const controller = require("../controllers/rejectedController");

router.post("/pedidos/rechazado", controller.logRejected);
router.get("/rechazados", controller.getRejected);

module.exports = router;
