// Base API URL config
const API_BASE_URL = '/api/auth';

// 1. Check if user is already logged in, if so redirect to index.html
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'index.html';
    }
});

// 2. Tab switching logic
function switchTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const alertBox = document.getElementById('alert-box');

    // Reset Alert Box
    alertBox.classList.add('d-none');

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.remove('d-none');
        registerForm.classList.add('d-none');

        // Toggle required attributes
        document.getElementById('login-username').required = true;
        document.getElementById('login-password').required = true;

        document.getElementById('register-username').required = false;
        document.getElementById('register-email').required = false;
        document.getElementById('register-password').required = false;
        document.getElementById('register-confirm-password').required = false;
    } else {
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');

        // Toggle required attributes
        document.getElementById('login-username').required = false;
        document.getElementById('login-password').required = false;

        document.getElementById('register-username').required = true;
        document.getElementById('register-email').required = true;
        document.getElementById('register-password').required = true;
        document.getElementById('register-confirm-password').required = true;
    }
}

// 3. Helper to show Alerts
function showAlert(message, isSuccess = false) {
    const alertBox = document.getElementById('alert-box');
    const alertIcon = document.getElementById('alert-icon');
    const alertText = document.getElementById('alert-text');

    alertBox.className = isSuccess ? 'alert alert-success' : 'alert alert-danger';
    alertIcon.className = isSuccess ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
    alertText.textContent = message;

    alertBox.classList.remove('d-none');
}

// 4. Handle Login Form Submit
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginBtn = document.getElementById('login-btn');
    const usernameOrEmail = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        // Disable button & show spinner state
        loginBtn.disabled = true;
        loginBtn.innerHTML = `<span>Signing in...</span> <i class="fa-solid fa-circle-notch fa-spin"></i>`;

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usernameOrEmail, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login failed. Please try again.');
        }

        // Display Success
        showAlert('Sign In successful! Redirecting...', true);

        // Store Token & User metadata
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect after slight delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        showAlert(error.message);
        // Reset button state
        loginBtn.disabled = false;
        loginBtn.innerHTML = `<span>Sign In</span> <i class="fa-solid fa-arrow-right-to-bracket"></i>`;
    }
});

// 5. Handle Registration Form Submit
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const registerBtn = document.getElementById('register-btn');
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Password matches validation
    if (password !== confirmPassword) {
        showAlert('Passwords do not match.');
        return;
    }

    try {
        // Disable button & show loading state
        registerBtn.disabled = true;
        registerBtn.innerHTML = `<span>Registering...</span> <i class="fa-solid fa-circle-notch fa-spin"></i>`;

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Registration failed. Please try again.');
        }

        showAlert('Account created! Logging you in automatically...', true);

        // Automatic Login after Registration
        const loginResponse = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usernameOrEmail: username, password })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok && loginData.success) {
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // If auto-login fails, redirect them to sign-in tab
            setTimeout(() => {
                switchTab('login');
                showAlert('Registration successful! Please sign in with your credentials.', true);
                registerBtn.disabled = false;
                registerBtn.innerHTML = `<span>Create Account</span> <i class="fa-solid fa-user-plus"></i>`;
            }, 1000);
        }

    } catch (error) {
        showAlert(error.message);
        registerBtn.disabled = false;
        registerBtn.innerHTML = `<span>Create Account</span> <i class="fa-solid fa-user-plus"></i>`;
    }
});
