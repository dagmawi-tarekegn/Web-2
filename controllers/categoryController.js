const Category = require('../models/Category');

/**
 * Get all categories (default system categories + user's custom categories)
 */
const getCategories = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const categories = await Category.findAllByUserId(userId);
        
        return res.json({
            success: true,
            categories
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new custom category for the user
 */
const createCategory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, type } = req.body;

        // Validation
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: 'Category name and type are required.'
            });
        }

        const trimmedName = name.trim();
        const normalizedType = type.trim().toLowerCase();

        if (trimmedName.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Category name cannot be empty.'
            });
        }

        if (normalizedType !== 'income' && normalizedType !== 'expense') {
            return res.status(400).json({
                success: false,
                message: "Category type must be either 'income' or 'expense'."
            });
        }

        const newCategory = await Category.create(userId, trimmedName, normalizedType);

        return res.status(201).json({
            success: true,
            message: 'Category created successfully.',
            category: newCategory
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing custom category
 */
const updateCategory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const categoryId = parseInt(req.params.id, 10);
        const { name, type } = req.body;

        if (isNaN(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID.'
            });
        }

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: 'Category name and type are required.'
            });
        }

        const trimmedName = name.trim();
        const normalizedType = type.trim().toLowerCase();

        if (trimmedName.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Category name cannot be empty.'
            });
        }

        if (normalizedType !== 'income' && normalizedType !== 'expense') {
            return res.status(400).json({
                success: false,
                message: "Category type must be either 'income' or 'expense'."
            });
        }

        // Fetch category to check permissions
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            });
        }

        // Enforce protection on default categories (user_id IS NULL)
        if (category.user_id === null) {
            return res.status(403).json({
                success: false,
                message: 'Default system categories cannot be modified.'
            });
        }

        // Enforce owner check
        if (category.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You do not own this category.'
            });
        }

        const updated = await Category.update(categoryId, userId, trimmedName, normalizedType);
        if (updated) {
            return res.json({
                success: true,
                message: 'Category updated successfully.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to update category.'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a custom category
 */
const deleteCategory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const categoryId = parseInt(req.params.id, 10);

        if (isNaN(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID.'
            });
        }

        // Fetch category to check permissions
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            });
        }

        // Enforce protection on default categories (user_id IS NULL)
        if (category.user_id === null) {
            return res.status(403).json({
                success: false,
                message: 'Default system categories cannot be deleted.'
            });
        }

        // Enforce owner check
        if (category.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You do not own this category.'
            });
        }

        const deleted = await Category.delete(categoryId, userId);
        if (deleted) {
            return res.json({
                success: true,
                message: 'Category deleted successfully.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete category.'
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
