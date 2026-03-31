const express = require("express");
const router = express.Router();
const controller = require("../controller/depot.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");


// File fields for upload
const uploadFields = upload.fields([
  { name: "fichierCIN",              maxCount: 1 },
  { name: "fichierRNE",              maxCount: 1 },
  { name: "fichierProcuration",      maxCount: 1 },
  { name: "fichierDossierJuridique", maxCount: 1 },
  { name: "fichierFacture",          maxCount: 1 },
]);

router.post("/", authMiddleware, uploadFields, controller.createDepot);
router.get("/",                 authMiddleware, controller.getAllDepots);
router.get("/mes-depots",       authMiddleware, controller.getMesDepots);
router.get("/search", authMiddleware, controller.searchDepots);
router.get("/:id",              authMiddleware, controller.getDepotById);
router.delete("/:id",           authMiddleware, controller.deleteDepot);
router.put("/:id/payer", authMiddleware, controller.payerDepot);
router.put("/:id/renouveler", authMiddleware, upload.fields([{ name: "fichierDemandeRenouvellement", maxCount: 1 }]), controller.renouvelerDepot);
module.exports = router;