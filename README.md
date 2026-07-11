# Personal Finance Tracker
A simple Personal Finance Tracker built using **Node.js, Express, SQLite, and Vanilla HTML/CSS/JS**. It enables users to manage income/expenses and check financial overviews.
---
## Features
*   **User Accounts**: Registration/login with encrypted passwords (`bcryptjs`) and JWT based authentication.
*   **Categories**: Custom categories along with built in defaults (e.g. Salary, Rent, Food).
*   **Transactions**: Full CRUD support for income/expense entries.
*   **Dashboard**: Live stats (Income, Expenses, Balance) and category wise breakdowns.
*   **User Isolation**: Each user can only view and modify their own categories and transactions.
---
## Setup & Running
### 1. Install dependencies:
```bash
npm install
```
### 2. Set up environment:
Create a `.env` file in the project root:
```env
PORT=3000
JWT_SECRET=finance_tracker_jwt_secret_token_key_2026
```
### 3. Launch application:
```bash
npm start
```
This automatically sets up the SQLite database and seeds the default categories.
### 4. Open in your browser:
Go to:
```text
http://localhost:3000/login.html
```
---
## Project Structure
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
