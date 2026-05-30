import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';

export default function CacadorComClaude() {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleEnviar = async () => {
    if (!pergunta.trim()) {
      setErro('Digite uma pergunta!');
      return;
    }

    setCarregando(true);
    setErro('');
    setResposta('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta }),
      });

      const data = await res.json();

      if (res.ok) {
        setResposta(data.resposta);
        setPergunta('');
      } else {
        setErro(data.erro || 'Erro desconhecido');
      }
    } catch (error) {
      setErro('Erro ao conectar com Claude. Verifique a API Key na Vercel.');
    }

    setCarregando(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-amber-500 mb-3">
            🎯 CAÇADOR DE POZINHOS
          </h1>
          <p className="text-amber-300 text-xl font-semibold">
            Com Claude IA! 🤖
          </p>
          <p className="text-amber-200/70 mt-2">
            Faça qualquer pergunta sobre opções e Claude responde!
          </p>
        </div>

        {/* Chat Box */}
        <div className="bg-slate-800/70 border-2 border-amber-500/40 rounded-2xl p-8 shadow-2xl">
          {/* Input Area */}
          <div className="mb-6">
            <label className="block text-amber-300 font-bold mb-3 text-lg">
              💭 Sua pergunta:
            </label>
            <textarea
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-slate-700 border-2 border-amber-500/30 rounded-lg px-4 py-3 text-amber-200 placeholder-amber-300/50 focus:outline-none focus:border-amber-500 transition"
              placeholder="Ex: Qual opção está mais barata? Quanto ganhei? Qual é a melhor estratégia?"
              rows="4"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleEnviar}
            disabled={carregando}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-slate-900 font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
          >
            {carregando ? (
              <>
                <span className="animate-spin">⏳</span>
                Claude pensando...
              </>
            ) : (
              <>
                ✨ Pergunte ao Claude!
                <Send className="w-6 h-6" />
              </>
            )}
          </button>

          {/* Error Message */}
          {erro && (
            <div className="mt-6 bg-red-900/30 border-2 border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 font-semibold">{erro}</p>
            </div>
          )}

          {/* Response */}
          {resposta && (
            <div className="mt-8 bg-gradient-to-br from-amber-900/20 to-orange-900/10 border-2 border-amber-500/40 rounded-lg p-6">
              <p className="text-amber-300 font-bold mb-3 text-lg">
                📊 Resposta do Claude:
              </p>
              <div className="text-amber-100 leading-relaxed text-base whitespace-pre-wrap">
                {resposta}
              </div>
            </div>
          )}
        </div>

        {/* Footer Tips */}
        <div className="mt-12 bg-slate-800/50 border border-amber-500/20 rounded-lg p-6 text-center">
          <p className="text-amber-300 font-bold mb-2">💡 DICAS:</p>
          <div className="text-amber-200/80 text-sm space-y-1">
            <p>"Qual opção mais barata agora?"</p>
            <p>"Quais são as melhores opções?"</p>
            <p>"Explique como funciona uma opção de compra"</p>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 text-center text-amber-300/50 text-xs">
          <p>✅ Conectado com Claude IA</p>
          <p>API Key: Configurada na Vercel</p>
        </div>
      </div>
    </div>
  );
}
