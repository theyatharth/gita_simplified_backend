const express = require("express");
const router = express.Router();
const { createQuestion, getAllQuestions, getQuestionById, updateQuestion, deleteQuestion } = require("../controllers/questionCtrl");


router.post("/createQuestion", createQuestion);
router.get("/getAllQuestions", getAllQuestions);
router.get("/getQuestion:id", getQuestionById);
router.put("/updateQuestion:id", updateQuestion);
router.delete("/deleteQuestion/:id", deleteQuestion);

module.exports = router;