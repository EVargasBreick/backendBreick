const express = require("express");
const router = express.Router();

const controller = require("../controllers/pack_controller");

router.post("/packs", controller.registerPack);
router.get("/packs/lista", controller.getPacks);
router.put("/packs/id", controller.updatePackId);
module.exports = router;
