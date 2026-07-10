const fs = require('fs');
const path = require('path');

const logDir = path.resolve(__dirname, '../logs');
const logFile = path.join(logDir, 'app.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Helper to write to file
const writeToFile = (message) => {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    
    // Log to console
    console.log(logLine.trim());
    
    // Append to file
    fs.appendFile(logFile, logLine, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

// Request logger middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        writeToFile(`${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
    });
    next();
};

// Central Error Logger function
const logError = (error, req = null) => {
    const requestDetails = req ? `| Path: ${req.originalUrl} | Method: ${req.method}` : '';
    writeToFile(`ERROR: ${error.stack || error} ${requestDetails}`);
};

// Express global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
    logError(err, req);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = {
    requestLogger,
    logError,
    globalErrorHandler
};
