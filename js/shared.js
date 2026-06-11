const API_BASE_URL = 'https://backendemocentro.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
});

function renderHeader() {
    const header = document.getElementById('main-header');
    const isLoggedIn = !!localStorage.getItem('token');
    
    header.innerHTML = `
        <div class="logo">
            <h2>EmoCentro</h2>
        </div>
        <nav>
            <a href="index.html">Home</a>
            <a href="hemocentros.html">Hemocentros</a>
            <a href="sobre.html">Sobre</a>
            ${isLoggedIn 
                ? '<a href="agendamento.html">Agendar</a> <a href="agendamentos.html">Meus Agendamentos</a> <a href="#" id="logout-btn">Sair</a>' 
                : '<a href="login.html">Login</a>'
            }
        </nav>
    `;

    if (isLoggedIn) {
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
}

function renderFooter() {
    const footer = document.getElementById('main-footer');
    footer.innerHTML = `
        <p>&copy; 2026 EmoCentro - Doação de Sangue. Todos os direitos reservados.</p>
        <p>Apoie a causa. Doe sangue, salve vidas.</p>
    `;
}
