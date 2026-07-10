const jwt = require('jsonwebtoken');

/**
 * JWT Verification Middleware
 * Protects routes by checking if a valid Bearer token is provided in the Authorization header
 */
const verifyToken = (req, res, next) => {
    try {
        // Retrieve the Authorization header
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No authentication token provided.'
            });
        }

        // Check if header is formatted as 'Bearer <token>'
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid authorization format. Expected "Bearer <token>".'
            });
        }

        // Extract the token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication token is missing.'
            });
        }

        // Verify token
        const secret = process.env.JWT_SECRET || 'finance_tracker_jwt_secret_token_key_2026';
        const decoded = jwt.verify(token, secret);

        // Attach decoded user details (id, username) to request object
        req.user = decoded;
        
        next();
    } catch (err) {
        // Handle token expiration or signature invalidation
        let message = 'Access denied. Invalid token.';
        if (err.name === 'TokenExpiredError') {
            message = 'Access denied. Authentication token has expired.';
        }
        
        return res.status(401).json({
            success: false,
            message
        });
    }
};

module.exports = {
    verifyToken
};
