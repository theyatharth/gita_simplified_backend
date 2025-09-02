const express = require("express");
const router = express.Router();
const { getQuestions, submitQuestionnaire, getLatestQuestionnaire } = require('../controllers/questionnaireCtrl');

router.get('/questions', getQuestions);
router.post('/submit', submitQuestionnaire);
router.get('/latest', getLatestQuestionnaire);

module.exports = router;