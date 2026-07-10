const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
} = require('../controllers/txnController');

// Secure all transaction routes with JWT validation
router.use(verifyToken);

// GET /api/transactions - Retrieve all transactions for user
router.get('/', getTransactions);

// POST /api/transactions - Create transaction
router.post('/', createTransaction);

// PUT /api/transactions/:id - Update transaction
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', deleteTransaction);

module.exports = router;
