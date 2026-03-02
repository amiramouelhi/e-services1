const express = require("express");
const router = express.Router();

const {createDeposant ,getAllDeposants,getDeposantById,searchDeposant,updateDeposant,deleteDeposant}=require("../controller/deposant.controller");

router.post("/",createDeposant);
router.get("/", getAllDeposants);
router.get("/:id",getDeposantById);
router.put("/:id",updateDeposant);
router.delete("/:id",deleteDeposant);

module.exports = router;