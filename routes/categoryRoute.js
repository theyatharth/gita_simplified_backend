const express = require("express");
const router = express.Router();
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require("../controllers/categoryCtrl");


router.post("/createCategory", createCategory);
router.get("/getAllCategories", getAllCategories);
router.get("/getCategoryById/:id", getCategoryById);
router.put("/updateCategory/:id", updateCategory);
router.delete("/deleteCategory/:id", deleteCategory);

module.exports = router;
