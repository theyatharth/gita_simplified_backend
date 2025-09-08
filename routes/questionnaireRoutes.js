const express = require("express");
const router = express.Router();
const { getQuestionnaire, submitQuestionnaire, getLatestQuestionnaire } = require('../controllers/questionnaireCtrl');

router.get('/all-questions', getQuestionnaire);
router.post('/submit-response', submitQuestionnaire);
router.get('/latest-score', getLatestQuestionnaire);

module.exports = router;