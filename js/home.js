const API_URL = 'http://localhost:3000/api';
let map;
let markers = [];

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('map')) {
        initMap();
        fetchHemocentros();
    }

    if (document.getElementById('search-btn')) {
        document.getElementById('search-btn').addEventListener('click', () => {
            const query = document.getElementById('search-input').value.toLowerCase();
            filterHemocentros(query);
        });
    }

    checkAdmin();
});

function checkAdmin() {
    const token = localStorage.getItem('token');
    const adminSection = document.getElementById('admin-section');
    if (token && adminSection) {
        adminSection.style.display = 'block';
        
        document.getElementById('form-cadastro-hemocentro').addEventListener('submit', async (e) => {
            e.preventDefault();
            const novoHemocentro = {
                nome: document.getElementById('nome').value,
                endereco: document.getElementById('endereco').value,
                telefone: document.getElementById('telefone').value,
                lat: parseFloat(document.getElementById('lat').value),
                lng: parseFloat(document.getElementById('lng').value)
            };

            try {
                const response = await fetch(`${API_URL}/hemocentros`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(novoHemocentro)
                });

                if (response.ok) {
                    alert('Hemocentro cadastrado com sucesso!');
                    document.getElementById('form-cadastro-hemocentro').reset();
                    fetchHemocentros();
                } else {
                    const error = await response.json();
                    alert(`Erro: ${error.error}`);
                }
            } catch (error) {
                console.error('Erro ao cadastrar:', error);
                alert('Erro na conexão com o servidor.');
            }
        });
    }
}

function initMap() {
    // Centralizado em Diadema por padrão
    map = L.map('map').setView([-23.6898, -46.6217], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

let allHemocentros = [];

async function fetchHemocentros() {
    try {
        const response = await fetch(`${API_URL}/hemocentros`);
        allHemocentros = await response.json();
        renderHemocentros(allHemocentros);
        updateMarkers(allHemocentros);
    } catch (error) {
        console.error('Erro ao buscar hemocentros:', error);
        const container = document.getElementById('hemocentros-list');
        if (container) {
            container.innerHTML = '<p>Erro ao carregar dados. Verifique se o servidor está rodando.</p>';
        }
    }
}

function renderHemocentros(list) {
    const container = document.getElementById('hemocentros-list');
    if (!container) return;
    
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p>Nenhum hemocentro encontrado.</p>';
        return;
    }

    list.forEach(h => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${h.nome}</h3>
            <p><strong>Endereço:</strong> ${h.endereco}</p>
            <p><strong>Telefone:</strong> ${h.telefone}</p>
            <button onclick="handleAgendamento(${h.id})">Agendar Doação</button>
        `;
        container.appendChild(card);
    });
}

function handleAgendamento(id) {
    const isLoggedIn = !!localStorage.getItem('token');
    if (isLoggedIn) {
        window.location.href = `agendamento.html?id=${id}`;
    } else {
        alert('Você precisa estar logado para agendar uma doação.');
        window.location.href = 'login.html';
    }
}

function updateMarkers(list) {
    if (!map) return;
    
    // Limpa marcadores existentes
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    list.forEach(h => {
        if (h.lat && h.lng) {
            const marker = L.marker([h.lat, h.lng]).addTo(map)
                .bindPopup(`<b>${h.nome}</b><br>${h.endereco}<br><a href="#" onclick="handleAgendamento(${h.id}); return false;">Agendar Agora</a>`);
            markers.push(marker);
        }
    });

    if (list.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function filterHemocentros(query) {
    const filtered = allHemocentros.filter(h => 
        h.nome.toLowerCase().includes(query) || 
        h.endereco.toLowerCase().includes(query)
    );
    renderHemocentros(filtered);
    updateMarkers(filtered);
}
