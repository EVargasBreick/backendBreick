const express = require("express");
const router = express.Router();

const controller = require("../controllers/storeController");

router.get("/agencias", controller.getStores);
module.exports = router;
