// Usando API_BASE_URL definido em shared.js
const API_URL = `${API_BASE_URL}/api`;

document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupLoginForm();
    setupRegisterForm();
    setupPasswordToggles();
});

function setupPasswordToggles() {
    const toggles = document.querySelectorAll('.toggle-password');
    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = 'Ocultar';
            } else {
                input.type = 'password';
                btn.textContent = 'Ver';
            }
        });
    });
}

function setupTabs() {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authMsg = document.getElementById('auth-msg');

    tabLogin.addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        authMsg.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        authMsg.style.display = 'none';
    });
}

function setupLoginForm() {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const msg = document.getElementById('auth-msg');

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                msg.textContent = data.error || 'Erro ao fazer login';
                msg.style.color = 'red';
                msg.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            msg.textContent = 'Erro de conexão com o servidor';
            msg.style.color = 'red';
            msg.style.display = 'block';
        }
    });
}

function setupRegisterForm() {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const msg = document.getElementById('auth-msg');

        // Validation: Passwords must match
        if (password !== confirmPassword) {
            msg.textContent = 'As senhas não coincidem';
            msg.style.color = 'red';
            msg.style.display = 'block';
            return;
        }

        // Validation: Complexity (min 6 chars, at least 1 number)
        const hasNumber = /\d/.test(password);
        if (password.length < 6 || !hasNumber) {
            msg.textContent = 'A senha deve ter pelo menos 6 caracteres e incluir pelo menos 1 número';
            msg.style.color = 'red';
            msg.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                msg.textContent = 'Conta criada com sucesso! Faça login abaixo.';
                msg.style.color = 'green';
                msg.style.display = 'block';
                // Reset form and switch to login tab
                document.getElementById('register-form').reset();
                setTimeout(() => {
                    document.getElementById('tab-login').click();
                    document.getElementById('login-email').value = email;
                }, 2000);
            } else {
                msg.textContent = data.error || 'Erro ao criar conta';
                msg.style.color = 'red';
                msg.style.display = 'block';
            }
        } catch (error) {
            console.error('Register error:', error);
            msg.textContent = 'Erro de conexão com o servidor';
            msg.style.color = 'red';
            msg.style.display = 'block';
        }
    });
}
