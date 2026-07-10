const { db } = require('../config/db');

class Transaction {
    /**
     * Find all transactions belonging to a specific user, joined with categories table
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static findAllByUserId(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT t.id, t.user_id, t.category_id, t.amount, t.description, t.date, t.created_at,
                       c.name AS category_name, c.type AS category_type
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ?
                ORDER BY t.date DESC, t.id DESC
            `;
            db.all(sql, [userId], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    /**
     * Find a single transaction by ID
     * @param {number} id 
     * @returns {Promise<object|null>}
     */
    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM transactions WHERE id = ?", [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }

    /**
     * Create a new transaction
     * @param {number} userId 
     * @param {number} categoryId 
     * @param {number} amount 
     * @param {string} description 
     * @param {string} date - YYYY-MM-DD
     * @returns {Promise<object>}
     */
    static create(userId, categoryId, amount, description, date) {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO transactions (user_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)",
                [userId, categoryId, amount, description, date],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({
                        id: this.lastID,
                        user_id: userId,
                        category_id: categoryId,
                        amount,
                        description,
                        date
                    });
                }
            );
        });
    }

    /**
     * Update an existing transaction (enforces owner user isolation check)
     * @param {number} id 
     * @param {number} userId 
     * @param {number} categoryId 
     * @param {number} amount 
     * @param {string} description 
     * @param {string} date 
     * @returns {Promise<boolean>} - true if updated, false otherwise
     */
    static update(id, userId, categoryId, amount, description, date) {
        return new Promise((resolve, reject) => {
            db.run(
                "UPDATE transactions SET category_id = ?, amount = ?, description = ?, date = ? WHERE id = ? AND user_id = ?",
                [categoryId, amount, description, date, id, userId],
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
     * Delete an existing transaction (enforces owner user isolation check)
     * @param {number} id 
     * @param {number} userId 
     * @returns {Promise<boolean>} - true if deleted, false otherwise
     */
    static delete(id, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                "DELETE FROM transactions WHERE id = ? AND user_id = ?",
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

module.exports = Transaction;
