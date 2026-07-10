const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Handle user registration
 */
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // 1. Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields (username, email, password) are required.'
            });
        }

        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (trimmedUsername.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Username must be at least 3 characters long.'
            });
        }

        // Simple email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // 2. Check duplicate username
        const existingUsername = await User.findByUsername(trimmedUsername);
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username is already taken.'
            });
        }

        // 3. Check duplicate email
        const existingEmail = await User.findByEmail(trimmedEmail);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        // 4. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 5. Create user
        const newUser = await User.create(trimmedUsername, trimmedEmail, passwordHash);

        // 6. Return response
        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register
};
