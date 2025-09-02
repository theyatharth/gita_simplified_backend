const express = require('express');
const router = express.Router();
const { addMood, getLatestMood, getMoodHistory } = require("../controllers/moodCtrl");


router.post('/addMood', addMood);
router.get('/LatestMood', getLatestMood);
router.get('/moodHistory', getMoodHistory);

module.exports = router;
