require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./config/db');
const { requestLogger, globalErrorHandler } = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const txnRoutes = require('./routes/txnRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', txnRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Finance Tracker API is online.'
    });
});

// Serve static assets from public folder (if public folder is populated later)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback for unhandled API routes (404)
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint ${req.method} ${req.originalUrl} not found.`
    });
});

// Centralized error handling middleware
app.use(globalErrorHandler);

// Initialize DB and start server
const startServer = async () => {
    try {
        console.log('Initializing database...');
        await initDb();
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server due to database initialization failure:', err);
        process.exit(1);
    }
};

startServer();
