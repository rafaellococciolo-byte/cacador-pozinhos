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

  try {
    const dadosPozinhos = await buscarPozinhos();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Você é especialista em opções da B3. Use estes dados do site opcoes.net.br:\n\n${dadosPozinhos}\n\nPergunta: ${pergunta}`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    const resposta = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';
    return res.status(200)