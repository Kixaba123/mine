document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('equipamento-form');
    const listaEquipamentos = document.getElementById('lista-equipamentos');
    const submitBtn = document.getElementById('submit-btn');
    const cancelarBtn = document.getElementById('cancelar-btn');
    const formTitulo = document.getElementById('form-titulo');
    let modoEdicao = false;
    let idEmEdicao = null;

    async function fetchEquipamentos() {
        try {
            const response = await fetch('http://localhost:3000/api/equipamentos');
            if (!response.ok) throw new Error('Erro ao buscar equipamentos.');
            const equipamentos = await response.json();
            displayEquipamentos(equipamentos);
        } catch (error) {
            console.error('Erro:', error);
            listaEquipamentos.innerHTML = '<li>Erro ao carregar os equipamentos.</li>';
        }
    }

    function displayEquipamentos(equipamentos) {
        listaEquipamentos.innerHTML = '';
        if (equipamentos.length === 0) {
            listaEquipamentos.innerHTML = '<li>Nenhum equipamento cadastrado.</li>';
            return;
        }
        equipamentos.forEach(equipamento => {
            const li = document.createElement('li');
            li.innerHTML = `
                <p><strong>Tag:</strong> ${equipamento.tag} | <strong>Horímetro:</strong> ${equipamento.horimetro} | <strong>Localização:</strong> ${equipamento.localizacao}</p>
                <div>
                    <button class="edit-btn" data-id="${equipamento._id}">Editar</button>
                    <button class="delete-btn" data-id="${equipamento._id}">Excluir</button>
                </div>
            `;
            listaEquipamentos.appendChild(li);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const equipamentoParaEditar = equipamentos.find(eq => eq._id === id);
                if (equipamentoParaEditar) {
                    entrarModoEdicao(equipamentoParaEditar);
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                handleDelete(id);
            });
        });
    }

    function entrarModoEdicao(equipamento) {
        modoEdicao = true;
        idEmEdicao = equipamento._id;
        formTitulo.textContent = 'Editar Equipamento';
        document.getElementById('tag').value = equipamento.tag;
        document.getElementById('horimetro').value = equipamento.horimetro;
        document.getElementById('localizacao').value = equipamento.localizacao;
        document.getElementById('descricao').value = equipamento.descricao || '';
        submitBtn.textContent = 'Salvar Alterações';
        cancelarBtn.style.display = 'inline-block';
    }

    function sairModoEdicao() {
        modoEdicao = false;
        idEmEdicao = null;
        formTitulo.textContent = 'Adicionar Novo Equipamento';
        form.reset();
        submitBtn.textContent = 'Salvar Equipamento';
        cancelarBtn.style.display = 'none';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const senha = document.getElementById('senha').value;
        const equipamentoData = {
            tag: document.getElementById('tag').value.toUpperCase(),
            horimetro: document.getElementById('horimetro').value,
            localizacao: document.getElementById('localizacao').value,
            descricao: document.getElementById('descricao').value,
            senha: senha
        };

        const method = modoEdicao ? 'PUT' : 'POST';
        const url = modoEdicao ? `http://localhost:3000/api/equipamentos/${idEmEdicao}` : 'http://localhost:3000/api/equipamentos';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipamentoData)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(modoEdicao ? 'Equipamento atualizado com sucesso!' : 'Equipamento salvo com sucesso!');
                sairModoEdicao();
                fetchEquipamentos();
            } else {
                alert(`Erro: ${result.error || 'Ocorreu um erro.'}`);
                console.error('Erro do servidor:', result);
            }
        } catch (error) {
            alert('Não foi possível conectar ao servidor.');
            console.error('Erro de conexão:', error);
        }
    });

    cancelarBtn.addEventListener('click', sairModoEdicao);

    async function handleDelete(id) {
        const senha = prompt("Por favor, insira a senha para excluir:");
        if (!senha) return;

        if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;
        try {
            const response = await fetch(`http://localhost:3000/api/equipamentos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': senha
                },
            });
            if (response.ok) {
                alert('Equipamento excluído com sucesso!');
                fetchEquipamentos();
            } else {
                const error = await response.json();
                alert(`Erro ao excluir: ${error.error}`);
            }
        } catch (error) {
            alert('Não foi possível conectar ao servidor.');
            console.error('Erro de conexão:', error);
        }
    }

    fetchEquipamentos();
});