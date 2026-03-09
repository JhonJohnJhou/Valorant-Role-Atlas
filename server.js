// Importamos o Express
const express = require('express');
const app = express();
const porta = 3000; 

// A mágica da arquitetura: Importamos os dados do arquivo separado!
// O './' significa "procure na mesma pasta onde eu estou"
const { agentes, funcoes } = require('./data');

// Esta linha diz para o Express liberar os arquivos da pasta 'public'
app.use(express.static('public'));

// ==========================================
// ROTAS DA API
// ==========================================

// ROTA 1: Buscar a função de um agente específico
app.get('/agente/:nome', (req, res) => {
    const nomeDigitado = req.params.nome;
    const nomesDosAgentes = Object.keys(agentes);
    const agenteEncontrado = nomesDosAgentes.find(nome => nome.toLowerCase() === nomeDigitado.toLowerCase());

    if (agenteEncontrado) {
        // PEGANDO O OBJETO COMPLETO DO AGENTE AGORA
        const dadosDoAgente = agentes[agenteEncontrado]; 
        
        // DEVOLVENDO A FUNÇÃO E A FALA SEPARADAMENTE
        res.json({ 
            sucesso: true, 
            agente: agenteEncontrado, 
            funcao: dadosDoAgente.funcao, 
            fala: dadosDoAgente.fala,
            imagem: dadosDoAgente.imagem,
        });
    } else {
        res.status(404).json({ sucesso: false, mensagem: `Agente "${nomeDigitado}" não encontrado.` });
    }
});

// ROTA 2: Buscar a lista de agentes de uma função específica
app.get('/funcao/:nome', (req, res) => {
    // Pegamos o que foi digitado, passamos para minúsculo e tiramos espaços extras
    const nomeDigitado = req.params.nome.toLowerCase().trim();
    const nomesDasFuncoes = Object.keys(funcoes);
    
    // A MÁGICA ACONTECE AQUI:
    const funcaoEncontrada = nomesDasFuncoes.find(f => {
        const singular = f.toLowerCase();
        
        // Se a palavra original termina com 'r' (Controlador/Iniciador), o plural é '+es'
        // Se não (Duelista/Sentinela), o plural é '+s'
        const plural = singular.endsWith('r') ? singular + 'es' : singular + 's';
        
        // Verifica se o que o usuário digitou bate com o singular OU com o plural
        return nomeDigitado === singular || nomeDigitado === plural;
    });

    if (funcaoEncontrada) {
        const listaDeNomes = funcoes[funcaoEncontrada];
        
        const agentesDetalhados = listaDeNomes.map(nome => {
            return {
                nome: nome,
                imagem: agentes[nome] ? agentes[nome].imagem : 'https://via.placeholder.com/150' 
            };
        });

        res.json({ sucesso: true, funcao: funcaoEncontrada, agentes: agentesDetalhados });
    } else {
        res.status(404).json({ sucesso: false, mensagem: `Função não encontrada.` });
    }
});

// Ligamos o servidor!
app.listen(porta, () => {
    console.log(`\n=> API do Valorant Role Atlas rodando com sucesso!`);
});

