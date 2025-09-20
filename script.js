document.addEventListener('DOMContentLoaded', async () => {
    const servicosContainer = document.getElementById('servicos-container');
    const addServicoBtn = document.getElementById('add-servico-btn');
    const enviarBtn = document.getElementById('enviar-btn');
    let servicoCount = 0;
    let listaEquipamentos = [];
    let relatorioId = null;

    async function carregarDadosEquipamentos() {
        try {
            const response = await fetch('http://localhost:3000/api/equipamentos');
            if (!response.ok) throw new Error('Erro ao buscar equipamentos.');
            listaEquipamentos = await response.json();
        } catch (error) {
            console.error('Erro ao carregar os dados dos equipamentos:', error);
        }
    }
    await carregarDadosEquipamentos();

    const urlParams = new URLSearchParams(window.location.search);
    relatorioId = urlParams.get('id');

    if (relatorioId) {
        enviarBtn.textContent = 'Salvar Alterações';
        try {
            const response = await fetch(`http://localhost:3000/api/relatorios/${relatorioId}`);
            if (response.ok) {
                const relatorio = await response.json();
                preencherFormularioParaEdicao(relatorio);
            } else {
                alert('Relatório não encontrado.');
            }
        } catch (error) {
            alert('Erro ao carregar relatório para edição. Verifique o servidor.');
            console.error('Erro:', error);
        }
    } else {
        enviarBtn.textContent = 'Salvar Relatório';
        setTodayDate();
        createServicoBlock();
    }

    function setTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        document.getElementById('relatorio-data').value = formattedDate;
    }

    function preencherFormularioParaEdicao(relatorio) {
        document.getElementById('lider').value = relatorio.lider;
        document.getElementById('executante').value = relatorio.executante;
        document.getElementById('relatorio-data').value = relatorio.data.split('T')[0];
        document.getElementById('escala-trabalho').value = relatorio.escalaTrabalho;
        document.getElementById('turno-manutencao').value = relatorio.turnoManutencao;

        relatorio.servicos.forEach(servico => {
            createServicoBlock(servico);
        });
    }

    function createServicoBlock(servicoParaPreencher = null) {
        servicoCount++;
        const servicoBlock = document.createElement('div');
        servicoBlock.classList.add('servico-box');
        servicoBlock.innerHTML = `
            <h3>Serviço #${servicoCount}</h3>
            <div class="form-group">
                <label for="equipamento-${servicoCount}">Equipamento (Tag):</label>
                <input type="text" id="equipamento-${servicoCount}" class="equipamento" required>
            </div>
            <div class="form-group">
                <label for="horimetro-${servicoCount}">Horímetro:</label>
                <input type="text" id="horimetro-${servicoCount}" class="horimetro" required>
            </div>
            <div class="form-group time-group">
                <label for="inicio-servico-${servicoCount}">Início do Serviço:</label>
                <input type="time" id="inicio-servico-${servicoCount}" class="inicio-servico">
            </div>
            <div class="form-group time-group">
                <label for="termino-servico-${servicoCount}">Término do Serviço:</label>
                <input type="time" id="termino-servico-${servicoCount}" class="termino-servico">
            </div>
            <div class="form-group">
                <label for="local-manutencao-${servicoCount}">Local da Manutenção:</label>
                <select id="local-manutencao-${servicoCount}" class="local-manutencao" required>
                    <option value="">Selecione</option>
                    <option value="Oficina Mecânica">Oficina Mecânica</option>
                    <option value="Mina">Mina</option>
                </select>
            </div>
            <div class="form-group status-group">
                <label>Status:</label>
                <div class="status-options">
                    <label><input type="checkbox" class="status-checkbox" value="Liberado"> Liberado</label>
                    <label><input type="checkbox" class="status-checkbox" value="Pendente"> Pendente</label>
                </div>
            </div>
            <div class="form-group">
                <label for="descricao-${servicoCount}">Descrição do Problema:</label>
                <textarea id="descricao-${servicoCount}" class="descricao" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label for="acao-${servicoCount}">Ação Corretiva:</label>
                <textarea id="acao-${servicoCount}" class="acao" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label for="pecas-${servicoCount}">Peças Utilizadas:</label>
                <input type="text" id="pecas-${servicoCount}" class="pecas">
            </div>
        `;
        servicosContainer.appendChild(servicoBlock);

        if (servicoParaPreencher) {
            servicoBlock.querySelector('.equipamento').value = servicoParaPreencher.equipamento || '';
            servicoBlock.querySelector('.horimetro').value = servicoParaPreencher.horimetro || '';
            servicoBlock.querySelector('.inicio-servico').value = servicoParaPreencher.inicioServico || '';
            servicoBlock.querySelector('.termino-servico').value = servicoParaPreencher.terminoServico || '';
            servicoBlock.querySelector('.local-manutencao').value = servicoParaPreencher.localManutencao || '';
            servicoBlock.querySelector('.descricao').value = servicoParaPreencher.descricao || '';
            servicoBlock.querySelector('.acao').value = servicoParaPreencher.acao || '';
            servicoBlock.querySelector('.pecas').value = servicoParaPreencher.pecas || '';
            
            const checkbox = servicoBlock.querySelector(`.status-checkbox[value="${servicoParaPreencher.status}"]`);
            if (checkbox) checkbox.checked = true;
        }

        const equipamentoInput = servicoBlock.querySelector('.equipamento');
        equipamentoInput.addEventListener('blur', (event) => {
            const tagDigitada = event.target.value.toUpperCase();
            const equipamentoEncontrado = listaEquipamentos.find(equip => equip.tag === tagDigitada);
            
            if (equipamentoEncontrado) {
                servicoBlock.querySelector('.horimetro').value = equipamentoEncontrado.horimetro;
                servicoBlock.querySelector('.local-manutencao').value = equipamentoEncontrado.localizacao;
            }
        });

        const checkboxes = servicoBlock.querySelectorAll('.status-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxes.forEach(otherCheckbox => {
                        if (otherCheckbox !== this) {
                            otherCheckbox.checked = false;
                        }
                    });
                }
            });
        });
    }
    
    addServicoBtn.addEventListener('click', () => createServicoBlock());

    enviarBtn.addEventListener('click', async () => {
        const relatorioData = {
            lider: document.getElementById('lider').value,
            executante: document.getElementById('executante').value,
            data: document.getElementById('relatorio-data').value,
            escalaTrabalho: document.getElementById('escala-trabalho').value,
            turnoManutencao: document.getElementById('turno-manutencao').value,
            servicos: []
        };
        
        const servicos = document.querySelectorAll('.servico-box');
        servicos.forEach(servico => {
            const equipamento = servico.querySelector('.equipamento').value;
            const horimetro = servico.querySelector('.horimetro').value;
            const inicioServico = servico.querySelector('.inicio-servico').value;
            const terminoServico = servico.querySelector('.termino-servico').value;
            const localManutencao = servico.querySelector('.local-manutencao').value;
            const statusCheckbox = servico.querySelector('.status-checkbox:checked');
            const status = statusCheckbox ? statusCheckbox.value : 'Não informado';
            const descricao = servico.querySelector('.descricao').value;
            const acao = servico.querySelector('.acao').value;
            const pecas = servico.querySelector('.pecas').value;

            relatorioData.servicos.push({
                equipamento,
                horimetro,
                inicioServico,
                terminoServico,
                localManutencao,
                status,
                descricao,
                acao,
                pecas
            });
        });

        const method = relatorioId ? 'PUT' : 'POST';
        const url = relatorioId ? `http://localhost:3000/api/relatorios/${relatorioId}` : 'http://localhost:3000/api/relatorios';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(relatorioData)
            });

            if (response.ok) {
                alert('Relatório salvo com sucesso!');
                window.location.href = 'relatorios.html';
            } else {
                const error = await response.json();
                alert('Erro ao salvar o relatório. Verifique o console para mais detalhes.');
                console.error('Erro:', error);
            }
        } catch (error) {
            alert('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
            console.error('Erro de conexão:', error);
        }
    });
});