const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(null); } });
    }).on('error', reject);
  });
}

const ATIVOS = ['PETR4','VALE3','ITUB4','BBDC4','WEGE3','ABEV3','BBAS3','MGLU3','PCAR3','BEEF3','CSNA3','CVCB3'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { tipo='todos', pmin='0.01', pmax='0.05', vmin='500', dmin='180' } = req.query;
  const PMIN = parseFloat(pmin), PMAX = parseFloat(pmax), VMIN = parseInt(vmin), DMIN = parseInt(dmin);
  const hoje = new Date();

  try {
    const resultados = [];

    for (const ativo of ATIVOS) {
      try {
        const data = await fetchJSON(`https://brapi.dev/api/v2/options/${ativo}`);
        if (!data || !data.options) continue;

        data.options.forEach(op => {
          if (!op.contractSymbol || !op.lastPrice) return;
          const preco = parseFloat(op.lastPrice);
          const volume = parseInt(op.volume || 0);
          const tipoOp = op.type === 'call' ? 'CALL' : 'PUT';
          const venc = op.expirationDate ? new Date(op.expirationDate * 1000) : null;
          const dias = venc ? Math.round((venc - hoje) / 86400000) : 0;
          const vencStr = venc ? venc.toISOString().slice(0,10) : null;

          if (preco < PMIN || preco > PMAX) return;
          if (volume < VMIN) return;
          if (dias < DMIN) return;
          if (tipo !== 'todos' && tipoOp !== tipo) return;

          const oportunidade = preco <= 0.02 && volume >= 5000 && dias >= 180;
          const alerta = !oportunidade && preco <= 0.03 && volume >= 2000 && dias >= 120;

          resultados.push({
            codigo: op.contractSymbol,
            ativo,
            tipo: tipoOp,
            strike: parseFloat(op.strikePrice || 0),
            preco,
            volume,
            vencimento: vencStr,
            dias,
            oportunidade,
            alerta
          });
        });
      } catch(e) { continue; }
    }

    resultados.sort((a,b) => b.oportunidade - a.oportunidade || a.preco - b.preco);

    return res.status(200).json({
      sucesso: true,
      total: resultados.length,
      oportunidades: resultados.filter(o=>o.oportunidade).length,
      alertas: resultados.filter(o=>o.alerta).length,
      opcoes: resultados,
      timestamp: new Date().toISOString()
    });

  } catch(err) {
    return res.status(500).json({ sucesso: false, erro: err.message, opcoes: [] });
  }
};  