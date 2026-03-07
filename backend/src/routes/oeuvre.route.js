const express = require("express");
const router = express.Router();
const controller = require("../controller/oeuvre.controller");

router.post("/", controller.createOeuvre);
router.get("/", controller.getAllOeuvres);
router.get("/:id", controller.getOeuvreById);
router.put("/:id", controller.updateOeuvre);
router.delete("/:id", controller.deleteOeuvre);

module.exports = router;