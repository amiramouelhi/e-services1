const express = require("express");
const router = express.Router();
const controller = require("../controller/admin.controller");
const adminMiddleware = require("../middlewares/admin.middleware");

// Public
router.post("/login", controller.login);

// Protected (admin only)
router.get("/depots",          adminMiddleware, controller.getAllDepots);
router.get("/depots/:id",      adminMiddleware, controller.getDepotById);
router.put("/depots/:id/accepter", adminMiddleware, controller.accepterDepot);
router.put("/depots/:id/rejeter",  adminMiddleware, controller.rejeterDepot);
router.delete("/depots/:id",   adminMiddleware, controller.deleteDepot);
router.get("/deposants",       adminMiddleware, controller.getAllDeposants);
router.delete("/deposants/:id", adminMiddleware, controller.deleteDeposant);
router.get("/rapports/yearly", adminMiddleware, controller.getYearlyReport);
router.put("/parametres/password", adminMiddleware, controller.changePassword);
module.exports = router;