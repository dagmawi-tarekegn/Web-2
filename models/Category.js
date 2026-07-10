const { db } = require('../config/db');

class Category {
    /**
     * Find all categories accessible to a specific user (defaults + user custom)
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static findAllByUserId(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                "SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY id ASC",
                [userId],
                (err, rows) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(rows);
                }
            );
        });
    }

    /**
     * Find a single category by ID
     * @param {number} id 
     * @returns {Promise<object|null>}
     */
    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM categories WHERE id = ?", [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }

    /**
     * Create a new custom category for a user
     * @param {number} userId 
     * @param {string} name 
     * @param {string} type - 'income' or 'expense'
     * @returns {Promise<object>}
     */
    static create(userId, name, type) {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)",
                [userId, name, type],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: this.lastID, user_id: userId, name, type });
                }
            );
        });
    }

    /**
     * Update a user's custom category (prevents modifying system categories)
     * @param {number} id 
     * @param {number} userId 
     * @param {string} name 
     * @param {string} type 
     * @returns {Promise<boolean>} - true if updated, false if not found or unauthorized
     */
    static update(id, userId, name, type) {
        return new Promise((resolve, reject) => {
            db.run(
                "UPDATE categories SET name = ?, type = ? WHERE id = ? AND user_id = ?",
                [name, type, id, userId],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.changes > 0);
                }
            );
        });
    }

    /**
     * Delete a user's custom category (prevents deleting system categories)
     * @param {number} id 
     * @param {number} userId 
     * @returns {Promise<boolean>} - true if deleted, false if not found or unauthorized
     */
    static delete(id, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                "DELETE FROM categories WHERE id = ? AND user_id = ?",
                [id, userId],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.changes > 0);
                }
            );
        });
    }
}

module.exports = Category;
