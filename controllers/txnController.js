const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

/**
 * Get all transactions for the authenticated user (joined with categories)
 */
const getTransactions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.findAllByUserId(userId);
        
        return res.json({
            success: true,
            transactions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new transaction for the user
 */
const createTransaction = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { categoryId, amount, description, date } = req.body;

        // 1. Basic validation
        if (categoryId === undefined || amount === undefined || !date) {
            return res.status(400).json({
                success: false,
                message: 'Category ID, amount, and date are required.'
            });
        }

        const parsedCatId = parseInt(categoryId, 10);
        const parsedAmount = parseFloat(amount);
        const trimmedDesc = description ? description.trim() : '';
        const trimmedDate = date.trim();

        if (isNaN(parsedCatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Category ID.'
            });
        }

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number greater than 0.'
            });
        }

        // Validate YYYY-MM-DD date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(trimmedDate) || isNaN(Date.parse(trimmedDate))) {
            return res.status(400).json({
                success: false,
                message: 'Date must be a valid date in YYYY-MM-DD format.'
            });
        }

        // 2. Validate category access
        const category = await Category.findById(parsedCatId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Selected category does not exist.'
            });
        }

        // Block using custom categories belonging to other users
        if (category.user_id !== null && category.user_id !== userId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or unauthorized category selected.'
            });
        }

        // 3. Create transaction
        const newTxn = await Transaction.create(userId, parsedCatId, parsedAmount, trimmedDesc, trimmedDate);

        return res.status(201).json({
            success: true,
            message: 'Transaction created successfully.',
            transaction: newTxn
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing transaction
 */
const updateTransaction = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const txnId = parseInt(req.params.id, 10);
        const { categoryId, amount, description, date } = req.body;

        if (isNaN(txnId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction ID.'
            });
        }

        // 1. Basic validation
        if (categoryId === undefined || amount === undefined || !date) {
            return res.status(400).json({
                success: false,
                message: 'Category ID, amount, and date are required.'
            });
        }

        const parsedCatId = parseInt(categoryId, 10);
        const parsedAmount = parseFloat(amount);
        const trimmedDesc = description ? description.trim() : '';
        const trimmedDate = date.trim();

        if (isNaN(parsedCatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Category ID.'
            });
        }

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number greater than 0.'
            });
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(trimmedDate) || isNaN(Date.parse(trimmedDate))) {
            return res.status(400).json({
                success: false,
                message: 'Date must be a valid date in YYYY-MM-DD format.'
            });
        }

        // 2. Fetch and verify ownership of the transaction
        const txn = await Transaction.findById(txnId);
        if (!txn) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.'
            });
        }

        if (txn.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You do not own this transaction.'
            });
        }

        // 3. Verify access to the new category if category is being changed
        if (txn.category_id !== parsedCatId) {
            const category = await Category.findById(parsedCatId);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected category does not exist.'
                });
            }

            if (category.user_id !== null && category.user_id !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or unauthorized category selected.'
                });
            }
        }

        // 4. Perform update
        const updated = await Transaction.update(txnId, userId, parsedCatId, parsedAmount, trimmedDesc, trimmedDate);
        if (updated) {
            return res.json({
                success: true,
                message: 'Transaction updated successfully.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to update transaction.'
            });
        }

    } catch (error) {
        next(error);
    }
};

/**
 * Delete a transaction
 */
const deleteTransaction = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const txnId = parseInt(req.params.id, 10);

        if (isNaN(txnId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction ID.'
            });
        }

        // 1. Fetch transaction and verify ownership
        const txn = await Transaction.findById(txnId);
        if (!txn) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.'
            });
        }

        if (txn.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You do not own this transaction.'
            });
        }

        // 2. Perform deletion
        const deleted = await Transaction.delete(txnId, userId);
        if (deleted) {
            return res.json({
                success: true,
                message: 'Transaction deleted successfully.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete transaction.'
            });
        }

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
};
