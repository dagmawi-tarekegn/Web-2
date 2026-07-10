# Personal Finance Tracker

A lightweight Personal Finance Tracker built with **Node.js, Express, SQLite, and Vanilla HTML/CSS/JS**. It helps users track income/expenses and view financial summaries.

---

## 🚀 Features

*   **User Accounts**: Signup/login with hashed passwords (`bcryptjs`) and JWT authentication.
*   **Categories**: Custom categories and system defaults (e.g. Salary, Rent, Food).
*   **Transactions**: CRUD operations on income/expense transactions.
*   **Dashboard**: Real-time stats (Income, Expenses, Balance) and category breakdowns.
*   **User Isolation**: Users can only see and edit their own categories and transactions.

---

## 🛠️ Setup & Running

### 1. Install dependencies:
```bash
npm install
```

### 2. Configure environment:
Create a `.env` file in the root folder:
```env
PORT=3000
JWT_SECRET=finance_tracker_jwt_secret_token_key_2026
```

### 3. Start application:
```bash
npm start
```
This automatically initializes the SQLite database and populates standard categories.

### 4. Open in browser:
Navigate to:
```text
http://localhost:3000/login.html
```

---

## 📂 Project Structure

```text
web-2/
├── config/db.js          # SQLite database connection
├── controllers/          # Request handlers (auth, categories, transactions)
├── middleware/           # JWT authentication and request logger
├── models/               # Database query wrappers
├── public/               # Frontend files (HTML, CSS, client-side JS)
├── routes/               # API endpoints
├── schema.sql            # Database DDL schema
└── server.js             # Main server file
```

