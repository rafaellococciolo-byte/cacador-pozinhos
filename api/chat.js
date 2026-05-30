import Anthropic from '@anthropic-ai/sdk';

async function buscarPozinhos() {
  try {
    const response = await fetch('https://opcoes.net.br/opcoes/pozinhos');
    const html = await response.text();
    return html.substring(0, 3000);
  } catch (e) {
    return 'Não foi possível buscar dados do site.';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { pergunta } = req.body;

  if (!pergunta || !pergunta.trim()) {
    return res.status(400).json({ erro: 'Pergunta vazia' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ erro: 'API Key não configurada.' });
  }

  try {
    const dadosPozinhos = await buscarPozinhos();
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Você é especialista em opções da B3. Use estes dados do site opcoes.net.br:\n\n${dadosPozinhos}\n\nPergunta: ${pergunta}`
      }]
    });

    const resposta = message.content[0].type === 'text' ? message.content[0].text : 'Erro ao processar';
    return res.status(200).json({ resposta });

  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao conectar com Claude.' });
  }
}