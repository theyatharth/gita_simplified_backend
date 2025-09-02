const express = require('express');
const router = express.Router();
const { registerUser, loginUser, adminLogin } = require('../controllers/authCtrl');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/adminLogin', adminLogin)

module.exports = router;