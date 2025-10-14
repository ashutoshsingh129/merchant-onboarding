const express = require('express');
const { login, verifyToken, logout } = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', login);

// Verify token endpoint
router.get('/verify', verifyToken);

// Logout endpoint
router.post('/logout', logout);

module.exports = router;
