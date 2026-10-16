import React, { useState, useRef, useEffect } from 'react';

export default function SocraticPartner({ lang = 'tr' }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Merhaba, ben Sokratik Düşünce Partneriniz. Bugün üzerine kafa yormak istediğiniz, doğruluğundan kesinlikle emin olduğunuz o sarsılmaz iddia veya fikir nedir?'
    }
  ]);
  const [input, setInput] = useState('');
  const [matrix, setMatrix] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: currentInput }]);
    setInput('');
    setIsLoading(true);
    setCopyStatus('');

    try {
      const response = await fetch('/api/gemini/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: currentInput, lang })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply || 'Bu iddianın dayandığı temel varsayımı nasıl doğrularsınız?' }
      ]);

      setMatrix({
        claim: data.matrix?.claim || currentInput,
        counterClaim:
          data.matrix?.counterClaim ||
          'Bu durumun sadece gözlemcinin öznel algısına, dilsel sınırlarına veya sınırlı veri setine bağlı bir korelasyon olması ihtimali.',
        notProof:
          data.matrix?.notProof ||
          'Gözlemlenen pratik tutarlılık veya çoğunluğun mutabakatı, mutlak bir nedenselliğin ya da değişmez bir doğrunun kanıtı değildir.'
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'İddianız oldukça merak uyandırıcı. Ancak şu noktayı düşünmenizi rica ediyorum: Bu çıkarımın temelinde yatan ve henüz sorgulamadığınız o en büyük ön kabul nedir?'
        }
      ]);
      setMatrix({
        claim: currentInput,
        counterClaim: 'Bu durumun sadece gözlemcinin öznel algısına, dilsel sınırlarına veya sınırlı veri setine bağlı bir korelasyon olması ihtimali.',
        notProof: 'Gözlemlenen pratik tutarlılık veya çoğunluğun mutabakatı, mutlak bir nedenselliğin ya da değişmez bir doğrunun kanıtı değildir.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!matrix) return;
    const textToCopy = `[EPİSTEMİK ANALİZ]\n\nİddia:\n${matrix.claim}\n\nSokratik Karşı Tez:\n${matrix.counterClaim}\n\nNeyin Kanıtı Değildir?:\n${matrix.notProof}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const area = document.createElement('textarea');
        area.value = textToCopy;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      setCopyStatus('Analiz matrisi panoya kopyalandı!');
    } catch {
      setCopyStatus('Kopyalama başarısız oldu.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto bg-slate-950 text-slate-100 rounded-xl min-h-[550px] font-sans shadow-2xl border border-slate-800/50">
      <div className="flex-1 flex flex-col justify-between bg-slate-900/80 p-5 rounded-lg border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse"></div>
          <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">Sokratik Diyalog Laboratuvarı</h2>
        </div>

        <div className="overflow-y-auto h-96 space-y-4 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3.5 rounded-lg max-w-md text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 p-3 rounded-lg text-sm rounded-bl-none flex items-center gap-2">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                <span className="text-xs italic">Sokratik süzgeçten geçiriliyor...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="İddianızı, fikrinizi veya sarsılmaz kabul ettiğiniz bir tezi yazın..."
            className="flex-1 p-3 bg-slate-950 rounded border border-slate-800 text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder-slate-600 text-slate-100"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 px-5 py-3 rounded text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            Sorgula
          </button>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-900/80 p-5 rounded-lg border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <span className="text-lg">⚖️</span>
            <h3 className="text-sky-400 font-bold text-sm tracking-wide uppercase">Epistemik Süzgeç</h3>
          </div>

          {matrix ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Senin İddian:</span>
                <p className="bg-slate-950/80 p-2.5 rounded mt-1 text-slate-300 border border-slate-900 italic">"{matrix.claim}"</p>
              </div>
              <div>
                <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px]">Sokratik Karşı Tez:</span>
                <p className="bg-slate-950/80 p-2.5 rounded mt-1 text-slate-300 border border-slate-900">{matrix.counterClaim}</p>
              </div>
              <div>
                <span className="text-rose-400 font-semibold uppercase tracking-wider text-[10px]">Neyin Kanıtı Değildir?</span>
                <p className="bg-slate-950/80 p-2.5 rounded mt-1 text-slate-300 border border-slate-900">{matrix.notProof}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-3xl mb-3 opacity-30">🔍</span>
              <p className="text-slate-500 text-xs italic leading-relaxed px-4">
                Yandaki kutuya felsefi veya bilimsel bir iddianızı girip gönderdiğinizde, sistem buraya otomatik olarak o iddianın epistemolojik analiz matrisini çıkaracaktır.
              </p>
            </div>
          )}
        </div>

        {matrix && (
          <div>
            <button
              onClick={copyToClipboard}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 py-2.5 rounded text-xs font-bold text-white tracking-wider uppercase transition-all shadow-md"
            >
              Matrisi Panoya Kopyala
            </button>
            {copyStatus && <p className="text-[11px] text-emerald-400 text-center mt-2">{copyStatus}</p>}
          </div>
        )}
      </div>
    </div>
  );
}