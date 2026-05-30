const https = require('https');

function fetchSite(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function parseOpcoes(html, pmin, pmax, vmin, dmin) {
  const opcoes = [];
  const regex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const rows = html.match(regex) || [];
  const hoje = new Date();

  rows.forEach(row => {
    const cols = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [])
      .map(c => c.replace(/<[^>]+>/g, '').trim().replace(',', '.'));

    if (cols.length < 6) return;

    const codigo = cols[0];
    const preco = parseFloat(cols[1]);
    const volume = parseInt(cols[3]);
    const vencStr = cols[5];

    if (!codigo || isNaN(preco) || isNaN(volume)) return;
    if (preco < pmin || preco > pmax) return;
    if (volume < vmin) return;

    const tipo = codigo.match(/[A-L]/i) ? 'CALL' : 'PUT';
    const ativo = codigo.substring(0, 4);

    let vencDate = null;
    if (vencStr && vencStr.includes('/')) {
      const [d, m, y] = vencStr.split('/');
      vencDate = `20${y}-${m}-${d}`;
    }

    const dias = vencDate
      ? Math.round((new Date(vencDate) - hoje) / 86400000)
      : 0;

    if (dias < dmin) return;

    const oportunidade = preco <= 0.02 && volume >= 5000 && dias >= 180;
    const alerta = !oportunidade && preco <= 0.03 && volume >= 2000 && dias >= 120;

    opcoes.push({ codigo, ativo, tipo, preco, volume, vencimento: vencDate, dias, oportunidade, alerta });
  });

  return opcoes;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { tipo = 'todos', pmin = '0.01', pmax = '0.05', vmin = '500', dmin = '180' } = req.query;

  try {
    const html = await fetchSite('https://opcoes.net.br/opcoes/pozinhos');

    if (!html || html.length < 100) {
      return res.status(200).json({
        sucesso: false,
        erro: 'Site indisponível no momento',
        opcoes: [],
        total: 0
      });
    }

    let opcoes = parseOpcoes(
      html,
      parseFloat(pmin),
      parseFloat(pmax),
      parseInt(vmin),
      parseInt(dmin)
    );

    if (tipo !== 'todos') {
      opcoes = opcoes.filter(o => o.tipo === tipo);
    }

    opcoes.sort((a, b) => b.oportunidade - a.oportunidade || a.preco - b.preco);

    return res.status(200).json({
      sucesso: true,
      total: opcoes.length,
      oportunidades: opcoes.filter(o => o.oportunidade).length,
      alertas: opcoes.filter(o => o.alerta).length,
      opcoes,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return res.status(500).json({ sucesso: false, erro: err.message, opcoes: [] });
  }
};