# 🎯 Caçador de Pozinhos + Claude IA

App React que conecta com Claude API para analisar opções de bolsa de valores!

## 🚀 O que é?

Um chat interativo onde você faz perguntas sobre opções (call, put, spread, etc.) e Claude IA responde em tempo real!

## ✨ Features

✅ Interface bonita com Tailwind CSS  
✅ Chat com Claude IA  
✅ API Key segura (Environment Variables)  
✅ Deploy na Vercel (serverless)  
✅ Suporte a React Hooks  

## 📦 Como rodar localmente?

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USER/cacador-pozinhos.git
cd cacador-pozinhos

# 2. Instale as dependências
npm install

# 3. Configure a API Key
# Crie um arquivo .env.local na raiz do projeto:
REACT_APP_ANTHROPIC_API_KEY=sk-ant-seu-api-key

# 4. Rode o app
npm start
```

## 🌐 Deploy na Vercel

1. Conecte seu GitHub na Vercel
2. Selecione este repositório
3. Adicione a Environment Variable: `ANTHROPIC_API_KEY`
4. Clique "Deploy"
5. Pronto! 🎉

## 📁 Estrutura de arquivos

```
cacador-pozinhos/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   └── index.js
├── api/
│   └── chat.js
├── package.json
├── vercel.json
└── README.md
```

## 🔑 Como obter API Key?

1. Vá em: https://console.anthropic.com
2. Crie uma conta
3. Gere uma nova API Key
4. Copie e guarde em lugar seguro!

## 🤖 Exemplos de perguntas

- "Qual opção está mais barata agora?"
- "Como funciona uma opção de compra (call)?"
- "Qual é a melhor estratégia para iniciantes?"
- "Qual é o risco de uma opção spread?"

## 📧 Dúvidas?

- Email: seu-email@gmail.com
- GitHub: seu-github

---

**Feito com ❤️ para caçadores de pozinhos milionários! 🎯**
