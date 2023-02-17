const express = require("express");
const router = express.Router();
const controller = require("../controllers/clientController");

router.post("/client", controller.createNewClient);
router.post("/clientpos", controller.createNewClientPos);
router.get("/client/rs", controller.getClient);
router.get("/client", controller.getClientById);
router.get("/client/full", controller.getFullClient);
router.get("/client/count", controller.getNumberClients);
router.put("/client", controller.updateClient);
module.exports = router;
