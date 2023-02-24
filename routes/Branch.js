const express = require("express");
const router = express.Router();

const controller = require("../controllers/branch_controller");

router.get("/sucursales", controller.getBranches);
router.get("/sucursalesps", controller.getBranchesPos);
module.exports = router;
