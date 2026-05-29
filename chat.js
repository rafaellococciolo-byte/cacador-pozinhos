import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { pergunta } = req.body;

  // Validação
  if (!pergunta || !pergunta.trim()) {
    return res.status(400).json({ erro: 'Pergunta vazia' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ 
      erro: 'Erro: API Key não configurada. Verifique as Environment Variables na Vercel.' 
    });
  }

  try {
    // Criar cliente Anthropic
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Chamar Claude API
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Você é um especialista em opções de bolsa de valores brasileira (B3).
          
Analise esta pergunta sobre opções:

"${pergunta}"

Responda de forma clara, prática e concisa. Se for sobre opções específicas, comente sobre o potencial de ganho, risco e liquidez.`,
        },
      ],
    });

    // Extrair resposta
    const resposta = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Erro ao processar resposta';

    return res.status(200).json({ resposta });

  } catch (error) {
    console.error('Erro ao chamar Claude:', error);

    // Mensagens de erro específicas
    let mensagemErro = 'Erro ao processar sua pergunta';

    if (error.status === 401) {
      mensagemErro = 'API Key inválida. Verifique na Vercel.';
    } else if (error.status === 429) {
      mensagemErro = 'Muitas requisições. Aguarde um momento.';
    } else if (error.status === 500) {
      mensagemErro = 'Erro no servidor Claude. Tente novamente.';
    }

    return res.status(500).json({ erro: mensagemErro });
  }
}
