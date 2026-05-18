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
router.get("/users",                    adminMiddleware, controller.getAllUsers);
router.put("/users/:id/permissions",    adminMiddleware, controller.updateUserPermissions);
router.get("/rapports/yearly-renouv", adminMiddleware, controller.getYearlyRenouvellementsReport);
router.get("/autorisations",          adminMiddleware, controller.getAllAutorisations);
router.get("/autorisations/:id",      adminMiddleware, controller.getAutorisationById);
router.put("/autorisations/:id/prendre-en-charge", adminMiddleware, controller.prendreEnCharge);
router.put("/autorisations/:id/generer-facture",   adminMiddleware, controller.genererFacture);
router.put("/autorisations/:id/delivrer",          adminMiddleware, controller.delivrerAutorisation);
module.exports = router;