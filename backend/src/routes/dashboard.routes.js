const router = require("express").Router();
const controller = require("../controllers/dashboard.controller");
const { auth } = require("../utils/auth");

router.get("/", auth, controller.getDashboard);

module.exports = router;
