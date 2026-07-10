const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify-token (protected route for verifying JWT)
router.get('/verify-token', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid.',
        user: req.user
    });
});

module.exports = router;
