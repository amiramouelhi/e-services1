const express=require("express");
const router= express.Router();
const {getAllCategories,getCategoryById}=require("../controller/categorie.controller.js");

router.get("/",getAllCategories);
router.get("/:id",getCategoryById);

module.exports = router;
