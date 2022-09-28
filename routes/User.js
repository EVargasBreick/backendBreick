const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.get("/user/name", controller.getUserByName);
router.get("/user/id", controller.getUserById);
router.post("/user", controller.createNewUser);
module.exports = router;
