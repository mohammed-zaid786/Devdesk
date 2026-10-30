const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// POST /api/v1/auth/register - Route for user registration
router.post('/register', registerUser);

// POST /api/v1/auth/login - Route for user login
router.post('/login', loginUser);

module.exports = router;