const { db } = require('../config/db');

class User {
    /**
     * Find a user by their username
     * @param {string} username 
     * @returns {Promise<object|null>}
     */
    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }

    /**
     * Find a user by their email address
     * @param {string} email 
     * @returns {Promise<object|null>}
     */
    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }

    /**
     * Create a new user in the database
     * @param {string} username 
     * @param {string} email 
     * @param {string} passwordHash 
     * @returns {Promise<object>}
     */
    static create(username, email, passwordHash) {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                [username, email, passwordHash],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: this.lastID, username, email });
                }
            );
        });
    }
}

module.exports = User;
