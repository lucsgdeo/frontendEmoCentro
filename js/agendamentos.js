// Usando API_BASE_URL definido em shared.js
const API_URL = `${API_BASE_URL}/api`;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    fetchAgendamentos();

    document.getElementById('cancelar-modal').addEventListener('click', () => {
        document.getElementById('reagendar-modal').style.display = 'none';
    });

    document.getElementById('form-reagendar').addEventListener('submit', handleReagendar);
});

let allHemocentros = [];

async function fetchAgendamentos() {
    const token = localStorage.getItem('token');
    try {
        // Primeiro buscamos os hemocentros para poder mostrar o nome no card
        const respHemo = await fetch(`${API_URL}/hemocentros`);
        if (!respHemo.ok) throw new Error('Falha ao carregar hemocentros');
        allHemocentros = await respHemo.json();

        const userEmail = localStorage.getItem('userEmail');
        const response = await fetch(`${API_URL}/agendamentos?userEmail=${userEmail}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const agendamentos = await response.json();
            renderAgendamentos(agendamentos);
        } else {
            console.error('Erro ao buscar agendamentos');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

function renderAgendamentos(list) {
    const container = document.getElementById('agendamentos-list');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p>Você ainda não possui agendamentos.</p>';
        return;
    }

    list.forEach(a => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${a.hemocentroNome || 'Hemocentro Desconhecido'}</h3>
            <p><strong>Data:</strong> ${formatDate(a.data)}</p>
            <p><strong>Horário:</strong> ${a.horario}</p>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button onclick="openReagendar(${a.id}, '${a.data}', '${a.horario}')" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Reagendar</button>
                <button onclick="confirmarCancelamento(${a.id})" style="background-color: #777; font-size: 0.9rem; padding: 0.5rem 1rem;">Cancelar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function openReagendar(id, data, horario) {
    document.getElementById('reagendar-id').value = id;
    document.getElementById('nova-data').value = data;
    document.getElementById('novo-horario').value = horario;
    document.getElementById('reagendar-modal').style.display = 'flex';
}

async function handleReagendar(e) {
    e.preventDefault();
    const id = document.getElementById('reagendar-id').value;
    const token = localStorage.getItem('token');
    
    const payload = {
        data: document.getElementById('nova-data').value,
        horario: document.getElementById('novo-horario').value
    };

    try {
        const response = await fetch(`${API_URL}/agendamentos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Agendamento reagendado com sucesso!');
            document.getElementById('reagendar-modal').style.display = 'none';
            fetchAgendamentos();
        } else {
            alert('Erro ao reagendar.');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function confirmarCancelamento(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/agendamentos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Agendamento cancelado.');
                fetchAgendamentos();
            } else {
                alert('Erro ao cancelar.');
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }
}
