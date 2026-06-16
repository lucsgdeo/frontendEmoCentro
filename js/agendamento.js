// Usando API_BASE_URL definido em shared.js
const API_URL = `${API_BASE_URL}/api`;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const formContainer = document.getElementById('booking-form-container');
    const authCheck = document.getElementById('auth-check');

    if (!token) {
        formContainer.style.display = 'none';
        authCheck.style.display = 'block';
        return;
    }

    fetchHemocentros();
    setupForm();
});

async function fetchHemocentros() {
    try {
        const response = await fetch(`${API_URL}/hemocentros`);
        const hemocentros = await response.json();
        const select = document.getElementById('hemocentro-select');
        
        // Check for ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedId = urlParams.get('id');

        hemocentros.forEach(h => {
            const option = document.createElement('option');
            option.value = h.id;
            option.textContent = h.nome;
            if (h.id == preselectedId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao buscar hemocentros:', error);
    }
}

function setupForm() {
    document.getElementById('agendamento-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const hemocentroId = document.getElementById('hemocentro-select').value;
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;
        const msg = document.getElementById('booking-msg');
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');

        try {
            const response = await fetch(`${API_URL}/agendamentos`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ hemocentroId, data, horario, userEmail })
            });

            const result = await response.json();

            if (response.ok) {
                msg.textContent = 'Agendamento realizado com sucesso!';
                msg.style.color = 'green';
                document.getElementById('agendamento-form').reset();
            } else {
                msg.textContent = result.error || 'Erro ao agendar';
                msg.style.color = 'red';
            }
        } catch (error) {
            console.error('Booking error:', error);
            msg.textContent = 'Erro de conexão com o servidor';
            msg.style.color = 'red';
        }
    });
}
