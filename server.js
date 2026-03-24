require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(express.static('public'));

// 1. Verificamos se a chave existe antes de tudo
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ ERRO: Nenhuma chave encontrada no arquivo .env!");
}

const genAI = new GoogleGenerativeAI(apiKey);

app.post('/perguntar', async (req, res) => {
    try {
        const { pergunta } = req.body;
        console.log("⚓ Pergunta recebida:", pergunta);

        // 2. Usando o modelo que é o padrão atual do Google
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const promptSistema = "Responda como um pirata veterano de forma curta: ";
        
        const result = await model.generateContent(promptSistema + pergunta);
        const response = await result.response;
        const texto = response.text();

        console.log("🦜 Pirata respondeu com sucesso!");
        res.json({ resposta: texto });

    } catch (error) {
        console.error("❌ ERRO DETALHADO:", error); // Isso vai mostrar tudo no terminal
        
        let mensagem = "Erro no servidor.";
        if (error.message.includes("404")) {
            mensagem = "Erro 404: O modelo não foi encontrado. Verifique se sua chave API é nova e se você salvou o arquivo .env!";
        } else if (error.message.includes("403")) {
            mensagem = "Erro 403: Acesso negado. Sua chave pode estar bloqueada ou inválida.";
        }

        res.status(500).json({ resposta: "Arrr! O Kraken diz: " + mensagem });
    }
});

app.listen(3000, () => {
    console.log(`🚀 Navio ancorado em http://localhost:3000`);
    console.log(`🔑 Chave usada (primeiros 5 digitos): ${apiKey ? apiKey.substring(0, 5) : "NÃO ENCONTRADA"}`);
});