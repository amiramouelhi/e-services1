const express = require("express");
const router = express.Router();
const controller = require("../controller/auteur.controlleur");

router.post("/", controller.createAuteur);
router.get("/", controller.getAllAuteurs);
router.get("/:id", controller.getAuteurById);
router.put("/:id", controller.updateAuteur);
router.delete("/:id", controller.deleteAuteur);

module.exports = router;