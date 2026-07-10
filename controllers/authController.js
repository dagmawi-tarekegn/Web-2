const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

/**
 * Handle user login
 */
const login = async (req, res, next) => {
    try {
        const { usernameOrEmail, password } = req.body;

        // 1. Validation
        if (!usernameOrEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username/Email and password are required.'
            });
        }

        const trimmedInput = usernameOrEmail.trim();

        // 2. Find user by username or email
        let user = await User.findByUsername(trimmedInput);
        if (!user) {
            user = await User.findByEmail(trimmedInput.toLowerCase());
        }

        // 3. If user not found, return 401 (generic message for security)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username/email or password.'
            });
        }

        // 4. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username/email or password.'
            });
        }

        // 5. Generate JWT token
        const secret = process.env.JWT_SECRET || 'finance_tracker_jwt_secret_token_key_2026';
        const token = jwt.sign(
            { id: user.id, username: user.username },
            secret,
            { expiresIn: '24h' }
        );

        // 6. Return token and user info
        return res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};
