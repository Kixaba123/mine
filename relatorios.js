document.addEventListener('DOMContentLoaded', async () => {
    const relatoriosLista = document.getElementById('relatorios-lista');

    async function fetchRelatorios() {
        try {
            const response = await fetch('http://localhost:3000/api/relatorios');
            if (response.ok) {
                const relatorios = await response.json();
                displayRelatorios(relatorios);
            } else {
                console.error('Erro ao buscar relatórios:', await response.json());
                relatoriosLista.innerHTML = '<li>Erro ao carregar os relatórios.</li>';
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            relatoriosLista.innerHTML = '<li>Não foi possível conectar ao servidor.</li>';
        }
    }

    function displayRelatorios(relatorios) {
        relatoriosLista.innerHTML = '';
        if (relatorios.length === 0) {
            relatoriosLista.innerHTML = '<li>Nenhum relatório salvo.</li>';
            return;
        }

        relatorios.forEach(relatorio => {
            const relatorioItem = document.createElement('li');
            relatorioItem.classList.add('relatorio-item');
            
            const dataObj = new Date(relatorio.data);
            const dataFormatada = `${dataObj.getDate()}/${dataObj.getMonth() + 1}/${dataObj.getFullYear()}`;

            let content = `
                <h3>Relatório de ${dataFormatada}</h3>
                <p><strong>Líder:</strong> ${relatorio.lider}</p>
                <p><strong>Executante:</strong> ${relatorio.executante}</p>
                <p><strong>Escala:</strong> ${relatorio.escalaTrabalho}</p>
                <p><strong>Turno:</strong> ${relatorio.turnoManutencao}</p>
                <h4>Serviços:</h4>
            `;

            relatorio.servicos.forEach((servico, index) => {
                content += `<p>--- Serviço ${index + 1} ---<br>
                    <strong>Equipamento:</strong> ${servico.equipamento}<br>
                    <strong>Horímetro:</strong> ${servico.horimetro}<br>
                    <strong>Horário:</strong> ${servico.inicioServico || ''} - ${servico.terminoServico || ''}<br>
                    <strong>Local:</strong> ${servico.localManutencao}<br>
                    <strong>Status:</strong> ${servico.status}<br>
                    <strong>Problema:</strong> ${servico.descricao}<br>
                    <strong>Ação:</strong> ${servico.acao}<br>
                    <strong>Peças:</strong> ${servico.pecas || 'N/A'}</p>`;
            });

            relatorioItem.innerHTML = content;
            
            const whatsappBtn = document.createElement('button');
            whatsappBtn.textContent = 'Enviar no WhatsApp';
            whatsappBtn.classList.add('whatsapp-btn');
            whatsappBtn.onclick = () => {
                const mensagem = formatarMensagemParaWhatsapp(relatorio);
                const numeroTelefone = ''; // Deixado em branco conforme sua solicitação
                const urlWhatsapp = `https://wa.me/${numeroTelefone}?text=${encodeURIComponent(mensagem)}`;
                window.open(urlWhatsapp, '_blank');
            };
            relatorioItem.appendChild(whatsappBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.onclick = () => handleDelete(relatorio._id);
            relatorioItem.appendChild(deleteBtn);
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Alterar';
            editBtn.classList.add('edit-btn');
            editBtn.onclick = () => handleEdit(relatorio._id);
            relatorioItem.appendChild(editBtn);

            relatoriosLista.appendChild(relatorioItem);
        });
    }

    function handleEdit(relatorioId) {
        window.location.href = `index.html?id=${relatorioId}`;
    }

    async function handleDelete(relatorioId) {
        if (!confirm('Tem certeza que deseja excluir este relatório?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/relatorios/${relatorioId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Relatório excluído com sucesso!');
                fetchRelatorios();
            } else {
                alert('Erro ao excluir o relatório.');
                console.error('Erro ao excluir:', await response.json());
            }
        } catch (error) {
            alert('Não foi possível conectar ao servidor.');
            console.error('Erro de conexão:', error);
        }
    }

    function formatarMensagemParaWhatsapp(relatorio) {
        const dataObj = new Date(relatorio.data);
        const dataFormatada = `${dataObj.getDate()}/${dataObj.getMonth() + 1}/${dataObj.getFullYear()}`;
        
        let mensagem = `*RELATÓRIO DIÁRIO DE MANUTENÇÃO*\n\n`;
        mensagem += `*Líder:* ${relatorio.lider}\n`;
        mensagem += `*Executante:* ${relatorio.executante}\n`;
        mensagem += `*Data:* ${dataFormatada}\n`;
        mensagem += `*Escala de Trabalho:* ${relatorio.escalaTrabalho}\n`;
        mensagem += `*Turno da Manutenção:* ${relatorio.turnoManutencao}\n\n`;
        
        relatorio.servicos.forEach((servico, index) => {
            mensagem += `--- *Serviço ${index + 1}* ---\n`;
            mensagem += `*Equipamento:* ${servico.equipamento}\n`;
            mensagem += `*Horímetro:* ${servico.horimetro}\n`;
            if (servico.inicioServico && servico.terminoServico) {
                mensagem += `*Horário:* ${servico.inicioServico} - ${servico.terminoServico}\n`;
            } else if (servico.inicioServico) {
                mensagem += `*Início:* ${servico.inicioServico}\n`;
            }
            mensagem += `*Local:* ${servico.localManutencao}\n`;
            mensagem += `*Status:* ${servico.status}\n`;
            mensagem += `*Problema:* ${servico.descricao}\n`;
            mensagem += `*Ação:* ${servico.acao}\n`;
            mensagem += `*Peças:* ${servico.pecas || 'N/A'}\n\n`;
        });
        
        return mensagem;
    }

    fetchRelatorios();
});