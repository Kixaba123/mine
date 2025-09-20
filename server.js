// Importa as bibliotecas necessárias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Inicializa o servidor Express
const app = express();

// Define a porta do servidor
const PORT = process.env.PORT || 3000;

// Configura os middlewares
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Conexão com o Banco de Dados MongoDB
const dbURI = process.env.DB_URI || 'mongodb+srv://admin:<1P2p3p4p5p>@estoque.hrlgg.mongodb.net/?retryWrites=true&w=majority&appName=estoque';

mongoose.connect(dbURI)
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

// --- Definição dos Esquemas e Modelos ---
const relatorioSchema = new mongoose.Schema({
    lider: { type: String, required: true },
    executante: { type: String, required: true },
    data: { type: Date, required: true },
    escalaTrabalho: { type: String, required: true },
    turnoManutencao: { type: String, required: true },
    servicos: Array
}, { timestamps: true });

const Relatorio = mongoose.model('Relatorio', relatorioSchema);

const equipamentoSchema = new mongoose.Schema({
    tag: { type: String, required: true, unique: true },
    horimetro: { type: Number, required: true },
    localizacao: { type: String, required: true },
    descricao: String
});

const Equipamento = mongoose.model('Equipamento', equipamentoSchema);

// --- Middleware de Autenticação com Senha ---
const SENHA_DE_AUTORIZACAO = process.env.AUTH_PASSWORD || '123456';

function verificarSenha(req, res, next) {
    const senha = req.body?.senha || req.headers.authorization;
    if (senha === SENHA_DE_AUTORIZACAO) {
        next();
    } else {
        res.status(401).json({ error: 'Senha incorreta. Acesso não autorizado.' });
    }
}

// --- Rotas da API para Relatórios ---
app.post('/api/relatorios', async (req, res) => {
    try {
        const novoRelatorio = new Relatorio(req.body);
        await novoRelatorio.save();
        res.status(201).json({ message: 'Relatório salvo com sucesso!', relatorio: novoRelatorio });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao salvar o relatório.', details: err.message });
    }
});

app.get('/api/relatorios', async (req, res) => {
    try {
        const relatorios = await Relatorio.find().sort({ createdAt: -1 });
        res.status(200).json(relatorios);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar os relatórios.', details: err.message });
    }
});

app.get('/api/relatorios/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID de relatório inválido.' });
        }
        const relatorio = await Relatorio.findById(req.params.id);
        if (!relatorio) {
            return res.status(404).json({ error: 'Relatório não encontrado.' });
        }
        res.status(200).json(relatorio);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno ao buscar o relatório.', details: err.message });
    }
});

app.put('/api/relatorios/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID de relatório inválido.' });
        }
        const relatorioAtualizado = await Relatorio.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!relatorioAtualizado) {
            return res.status(404).json({ error: 'Relatório não encontrado.' });
        }
        res.status(200).json({ message: 'Relatório atualizado com sucesso!', relatorio: relatorioAtualizado });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao alterar o relatório.', details: err.message });
    }
});

app.delete('/api/relatorios/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID de relatório inválido.' });
        }
        const relatorioExcluido = await Relatorio.findByIdAndDelete(req.params.id);
        if (!relatorioExcluido) {
            return res.status(404).json({ error: 'Relatório não encontrado.' });
        }
        res.status(200).json({ message: 'Relatório excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir o relatório.', details: err.message });
    }
});

// --- Rotas da API para Equipamentos ---
app.post('/api/equipamentos', verificarSenha, async (req, res) => {
    try {
        const equipamentoData = { ...req.body };
        delete equipamentoData.senha;
        const novoEquipamento = new Equipamento(equipamentoData);
        await novoEquipamento.save();
        res.status(201).json({ message: 'Equipamento salvo com sucesso!', equipamento: novoEquipamento });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Erro: A tag do equipamento já existe.', details: err.message });
        }
        res.status(400).json({ error: 'Erro ao salvar o equipamento.', details: err.message });
    }
});

app.get('/api/equipamentos', async (req, res) => {
    try {
        const equipamentos = await Equipamento.find().sort({ tag: 1 });
        res.status(200).json(equipamentos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar os equipamentos.', details: err.message });
    }
});

app.put('/api/equipamentos/:id', verificarSenha, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID de equipamento inválido.' });
        }
        const equipamentoData = { ...req.body };
        delete equipamentoData.senha;
        const equipamentoAtualizado = await Equipamento.findByIdAndUpdate(req.params.id, equipamentoData, { new: true, runValidators: true });
        if (!equipamentoAtualizado) {
            return res.status(404).json({ error: 'Equipamento não encontrado.' });
        }
        res.status(200).json({ message: 'Equipamento atualizado com sucesso!', equipamento: equipamentoAtualizado });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao alterar o equipamento.', details: err.message });
    }
});

app.delete('/api/equipamentos/:id', verificarSenha, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID de equipamento inválido.' });
        }
        const equipamentoExcluido = await Equipamento.findByIdAndDelete(req.params.id);
        if (!equipamentoExcluido) {
            return res.status(404).json({ error: 'Equipamento não encontrado.' });
        }
        res.status(200).json({ message: 'Equipamento excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir o equipamento.', details: err.message });
    }
});

// Inicia o servidor e o faz "escutar" a porta definida
app.listen(PORT, () => {
  console.log(`Servidor do MineFlow rodando em http://localhost:${PORT}`);
});