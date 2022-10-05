const express = require("express");
const router = express.Router();
const controller = require("../controllers/clientController");

router.post("/client", controller.createNewClient);
router.get("/client/rs", controller.getClient);
router.get("/client", controller.getClientById);
router.get("/client/full", controller.getFullClient);
router.put("/client", controller.updateClient);
module.exports = router;
