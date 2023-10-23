const express = require("express");
const router = express.Router();
const controller = require("../controllers/user_controller");

router.get("/user/name", controller.getUserByName);
router.get("/user/id", controller.getUserById);
router.post("/user", controller.createNewUser);
router.get("/user/basic", controller.getUserBasic);
router.post("/user/changePassword", controller.changeUserPassword);
router.get("/user/find/:search", controller.getUser);
router.get("/user/all", controller.getAll);
router.put("/user/update/:userId", controller.updateUser);
router.put("/user/update/all/:userId", controller.updateAllUser);
router.post("/user/update/goals", controller.insertAndUpdateGoals);
router.get("/user/weekly/goals", controller.weeklyGoal);
module.exports = router;
