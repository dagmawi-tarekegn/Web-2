const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// Secure all category routes with JWT validation
router.use(verifyToken);

// GET /api/categories - Retrieve all categories (system defaults + user customs)
router.get('/', getCategories);

// POST /api/categories - Create custom category
router.post('/', createCategory);

// PUT /api/categories/:id - Update custom category
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete custom category
router.delete('/:id', deleteCategory);

module.exports = router;
