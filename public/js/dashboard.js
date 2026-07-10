// Dashboard state and constants
const API_URL = '/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));
let categories = [];
let transactions = [];

// 1. Auth Guard
if (!token || !currentUser) {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Set greeting
    document.getElementById('username-display').textContent = currentUser.username;
    
    // Set default date input value to today
    document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];

    // Bind event listeners
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('category-form').addEventListener('submit', handleAddCategory);
    document.getElementById('transaction-form').addEventListener('submit', handleAddTransaction);

    // Initial data load
    loadDashboardData();
});

// 2. Load API Data
async function loadDashboardData() {
    try {
        await Promise.all([
            fetchCategories(),
            fetchTransactions()
        ]);
        
        renderDashboard();
    } catch (err) {
        showGlobalAlert(err.message || 'Error loading dashboard data.');
    }
}

async function fetchCategories() {
    const response = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch categories.');
    }
    categories = data.categories || [];
    populateCategoryDropdown();
}

async function fetchTransactions() {
    const response = await fetch(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch transactions.');
    }
    transactions = data.transactions || [];
}

// 3. UI Dropdown Population
function populateCategoryDropdown() {
    const select = document.getElementById('tx-category');
    // Keep first option
    select.innerHTML = '<option value="" disabled selected>Select category</option>';
    
    // Group categories into System and Custom for organized presentation
    const defaults = categories.filter(c => c.user_id === null);
    const customs = categories.filter(c => c.user_id !== null);

    if (defaults.length > 0) {
        const defaultGroup = document.createElement('optgroup');
        defaultGroup.label = 'Standard Categories';
        defaults.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = `${cat.name} (${cat.type})`;
            defaultGroup.appendChild(opt);
        });
        select.appendChild(defaultGroup);
    }

    if (customs.length > 0) {
        const customGroup = document.createElement('optgroup');
        customGroup.label = 'My Custom Categories';
        customs.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = `${cat.name} (${cat.type})`;
            customGroup.appendChild(opt);
        });
        select.appendChild(customGroup);
    }
}

// 4. Calculations and Rendering Engine
function renderDashboard() {
    let totalIncomeSum = 0;
    let totalExpenseSum = 0;
    const categoryTotals = {};

    // Grouping totals and summaries
    transactions.forEach(t => {
        const amt = parseFloat(t.amount);
        if (t.category_type === 'income') {
            totalIncomeSum += amt;
        } else if (t.category_type === 'expense') {
            totalExpenseSum += amt;
        }

        // Initialize category sum tracker
        if (!categoryTotals[t.category_name]) {
            categoryTotals[t.category_name] = {
                amount: 0,
                type: t.category_type
            };
        }
        categoryTotals[t.category_name].amount += amt;
    });

    const netBalanceSum = totalIncomeSum - totalExpenseSum;

    // Render summary metrics
    document.getElementById('total-income').textContent = formatCurrency(totalIncomeSum);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenseSum);

    const balanceEl = document.getElementById('net-balance');
    balanceEl.textContent = formatCurrency(netBalanceSum);
    if (netBalanceSum < 0) {
        balanceEl.className = 'metric-value text-danger';
    } else if (netBalanceSum > 0) {
        balanceEl.className = 'metric-value text-success';
    } else {
        balanceEl.className = 'metric-value';
    }

    // Render Recent Transactions
    renderTransactionsTable();

    // Render Category Breakdown
    renderCategoryBreakdown(categoryTotals, totalIncomeSum, totalExpenseSum);
}

function renderTransactionsTable() {
    const tbody = document.getElementById('transactions-body');
    const placeholder = document.getElementById('table-placeholder');
    const table = document.getElementById('transactions-table');

    tbody.innerHTML = '';

    if (transactions.length === 0) {
        table.classList.add('d-none');
        placeholder.classList.remove('d-none');
        return;
    }

    table.classList.remove('d-none');
    placeholder.classList.add('d-none');

    transactions.forEach(t => {
        const tr = document.createElement('tr');
        
        // Category Badge cell
        const catBadgeClass = t.category_type === 'income' ? 'badge badge-income' : 'badge badge-badge badge-expense';
        const typeIcon = t.category_type === 'income' ? '<i class="fa-solid fa-arrow-up-right-from-square"></i>' : '<i class="fa-solid fa-arrow-down-left-from-square"></i>';
        
        // Format Amount display
        const amtPrefix = t.category_type === 'income' ? '+' : '-';
        const amtClass = t.category_type === 'income' ? 'text-success' : 'text-danger';

        tr.innerHTML = `
            <td>
                <span class="${catBadgeClass}">${typeIcon} ${escapeHtml(t.category_name)}</span>
            </td>
            <td>${escapeHtml(t.date)}</td>
            <td class="text-secondary">${escapeHtml(t.description || '-')}</td>
            <td class="${amtClass} font-title" style="font-weight: 600;">${amtPrefix}${formatCurrency(t.amount)}</td>
            <td>
                <button class="btn-action-delete" title="Delete transaction" onclick="deleteTransaction(${t.id})">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCategoryBreakdown(categoryTotals, totalIncome, totalExpense) {
    const container = document.getElementById('breakdown-container');
    container.innerHTML = '';

    const catArray = Object.keys(categoryTotals).map(name => ({
        name,
        amount: categoryTotals[name].amount,
        type: categoryTotals[name].type
    })).sort((a, b) => b.amount - a.amount); // Sort by highest spending/earning

    if (catArray.length === 0) {
        container.innerHTML = `
            <div class="empty-placeholder">
                <i class="fa-solid fa-chart-line"></i>
                <p>No transaction data available yet.</p>
            </div>
        `;
        return;
    }

    catArray.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'breakdown-item';
        
        // Determine percentage weight of transaction group
        const denominator = cat.type === 'income' ? totalIncome : totalExpense;
        const percentage = denominator > 0 ? ((cat.amount / denominator) * 100).toFixed(0) : 0;
        
        const typeClass = cat.type === 'income' ? 'income' : 'expense';

        item.innerHTML = `
            <div class="breakdown-item-header">
                <div class="breakdown-name-wrap">
                    <span class="breakdown-dot ${typeClass}"></span>
                    <span class="breakdown-name">${escapeHtml(cat.name)}</span>
                </div>
                <span class="breakdown-amount text-secondary">${formatCurrency(cat.amount)} <small style="font-size: 0.75rem; color: var(--text-muted);">(${percentage}%)</small></span>
            </div>
            <div class="breakdown-progress-bar">
                <div class="breakdown-progress-fill ${typeClass}" style="width: ${percentage}%"></div>
            </div>
        `;
        container.appendChild(item);
    });
}

// 5. Form Submissions Handlers
async function handleAddCategory(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('cat-submit-btn');
    const nameInput = document.getElementById('cat-name');
    const typeSelect = document.getElementById('cat-type');

    const name = nameInput.value;
    const type = typeSelect.value;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Creating...</span> <i class="fa-solid fa-circle-notch fa-spin"></i>`;

        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, type })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to create category.');
        }

        showGlobalAlert('Category created successfully!', true);
        nameInput.value = '';
        typeSelect.selectedIndex = 0;

        // Re-load data to sync views
        await loadDashboardData();

    } catch (err) {
        showGlobalAlert(err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Create Category</span> <i class="fa-solid fa-plus"></i>`;
    }
}

async function handleAddTransaction(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('tx-submit-btn');
    const categorySelect = document.getElementById('tx-category');
    const amountInput = document.getElementById('tx-amount');
    const dateInput = document.getElementById('tx-date');
    const descInput = document.getElementById('tx-description');

    const categoryId = categorySelect.value;
    const amount = amountInput.value;
    const date = dateInput.value;
    const description = descInput.value;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Saving...</span> <i class="fa-solid fa-circle-notch fa-spin"></i>`;

        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ categoryId, amount, date, description })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to save transaction.');
        }

        showGlobalAlert('Transaction added successfully!', true);
        
        // Reset form inputs (preserve date)
        categorySelect.selectedIndex = 0;
        amountInput.value = '';
        descInput.value = '';

        // Re-load data to sync views
        await loadDashboardData();

    } catch (err) {
        showGlobalAlert(err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Save Transaction</span> <i class="fa-solid fa-plus"></i>`;
    }
}

// 6. Delete Transaction Action
async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to delete transaction.');
        }

        showGlobalAlert('Transaction deleted successfully!', true);
        await loadDashboardData();

    } catch (err) {
        showGlobalAlert(err.message);
    }
}

// 7. General Utility Actions
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function showGlobalAlert(message, isSuccess = false) {
    const alertBox = document.getElementById('alert-box');
    const alertIcon = document.getElementById('alert-icon');
    const alertText = document.getElementById('alert-text');

    alertBox.className = isSuccess ? 'alert alert-success' : 'alert alert-danger';
    alertIcon.className = isSuccess ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
    alertText.textContent = message;

    alertBox.classList.remove('d-none');

    // Auto scroll to top to see error alerts
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto hide after 3 seconds
    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
