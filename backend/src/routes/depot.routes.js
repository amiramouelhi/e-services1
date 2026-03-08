const express = require("express");
const router = express.Router();
const controller = require("../controller/depot.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Protected — must be logged in
router.post("/", authMiddleware, controller.createDepot);
router.get("/", authMiddleware, controller.getAllDepots);
router.get("/:id", authMiddleware, controller.getDepotById);
router.delete("/:id", authMiddleware, controller.deleteDepot);

module.exports = router;