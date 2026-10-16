import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, Send, RotateCcw, MessageSquare, Brain } from 'lucide-react';

interface MatrixData {
  claim: string;
  counterClaim: string;
  notProof: string;
  question?: string;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const SocraticPartner: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: 'Merhaba, ben Sokratik Düşünce Partneriniz. Bugün üzerine kafa yormak istediğiniz, doğruluğundan kesinlikle emin olduğunuz o sarsılmaz iddia veya fikir nedir?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [matrix, setMatrix] = useState<MatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input.trim();
    const userMsg: Message = { sender: 'user', text: currentInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/resolve-objection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: 'Sokratik Düşünce Partneri',
          userObjection: currentInput,
          articleContent: 'Kullanıcının kesin doğru kabul ettiği iddiasını diyalektik ve epistemik olarak sorgula.',
        }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.data) {
        const { concessions, rebuttal, epistemologicalSynthesis, notProof } = json.data;
        const botReply = `${concessions ? concessions + '\n\n' : ''}${rebuttal || ''}\n\nSokratik Soru: ${epistemologicalSynthesis || ''}`;
        setMessages(prev => [...prev, { sender: 'bot', text: botReply.trim() }]);
        setMatrix({
          claim: currentInput,
          counterClaim: rebuttal || 'Bu durumun gözlemcinin sınırlı algı çerçevesine dayalı bir çıkarım olması ihtimali.',
          notProof: notProof || 'Gözlemlenen pratik tutarlılık veya yaygın kanı, mutlak ve değişmez bir doğruluk kanıtı değildir.',
          question: epistemologicalSynthesis,
        });
      } else {
        throw new Error('Fallback required');
      }
    } catch {
      const socraticResponses = [
        "İddianız oldukça merak uyandırıcı. Ancak şu noktayı düşünmenizi rica ediyorum: Bu çıkarımınızın temelinde yatan ve henüz sorgulamadığınız o en büyük ön kabul nedir?",
        "Bu argüman ilk bakışta çok tutarlı görünüyor. Peki, iddia ettiğiniz durumun tam tersini gösteren tek bir istisna dahi olsaydı, kurduğunuz tüm bu mantık zinciri nasıl etkilenirdi?",
        "Düşüncenizin arkasındaki motivasyonu anlıyorum. Peki, bu yargıya varırken kullandığınız kavramsal tanımların kişisel deneyimlerinizin ötesinde, nesnel bir geçerliliği var mıdır?"
      ];
      const randomResponse = socraticResponses[Math.floor(Math.random() * socraticResponses.length)];
      setMessages(prev => [...prev, { sender: 'bot', text: randomResponse }]);
      setMatrix({
        claim: currentInput,
        counterClaim: "Bu durumun sadece gözlemcinin öznel algısına, dilsel sınırlarına veya sınırlı veri setine bağlı bir korelasyon olması ihtimali.",
        notProof: "Gözlemlenen pratik tutarlılık veya çoğunluğun mutabakatı, mutlak bir nedenselliğin ya da değişmez bir doğrunun kanıtı değildir.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!matrix) return;
    const textToCopy = `[EPISTEMİK SÜZGEÇ ANALİZİ]\n\nİddia:\n${matrix.claim}\n\nSokratik Karşı Tez:\n${matrix.counterClaim}\n\nNeyin Kanıtı Değildir?:\n${matrix.notProof}${matrix.question ? `\n\nSoru:\n${matrix.question}` : ''}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error("Kopyalama hatası: ", err));
  };

  const handleReset = () => {
    setMessages([
      { 
        sender: 'bot', 
        text: 'Merhaba, ben Sokratik Düşünce Partneriniz. Bugün üzerine kafa yormak istediğiniz, doğruluğundan kesinlikle emin olduğunuz o sarsılmaz iddia veya fikir nedir?' 
      }
    ]);
    setMatrix(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-6xl mx-auto bg-slate-950 text-slate-100 rounded-2xl min-h-[550px] font-sans shadow-2xl border border-cyan-500/20">
      
      {/* Sol Panel: Sohbet Alanı */}
      <div className="flex-1 flex flex-col justify-between bg-slate-900/90 p-4 sm:p-5 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-md shadow-cyan-400/50"></div>
            <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              Sokratik Düşünce Partneri (Gemini 3.8 Flash)
            </h2>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
            title="Sohbeti Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>
        </div>

        <div className="overflow-y-auto h-96 space-y-3.5 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3.5 rounded-2xl max-w-lg text-sm leading-relaxed shadow-md whitespace-pre-line ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-br-xs' 
                  : 'bg-slate-800/90 text-slate-200 rounded-bl-xs border border-slate-700/60'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-cyan-300 p-3 rounded-xl text-sm rounded-bl-xs flex items-center gap-2 border border-cyan-500/30">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                <span className="text-xs italic text-slate-300">Sokratik diyalektik süzgeçten geçiriliyor...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="İddianızı, fikrinizi veya sarsılmaz kabul ettiğiniz bir savı yazın..."
            className="flex-1 p-3 bg-slate-950 rounded-xl border border-slate-700/80 text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder-slate-500 text-slate-100"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 px-5 py-3 rounded-xl text-sm font-bold text-slate-950 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Sorgula</span>
          </button>
        </div>
      </div>

      {/* Sağ Panel: Epistemik Matris Kartı */}
      <div className="w-full lg:w-88 bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col justify-between backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-cyan-400 font-bold text-xs tracking-wider uppercase">Epistemik Analiz Matrisi</h3>
          </div>
          
          {matrix ? (
            <div className="space-y-3.5 text-xs">
              <div className="transition-all duration-300">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Senin İddian:</span>
                <p className="bg-slate-950 p-2.5 rounded-lg mt-1 text-slate-200 border border-slate-800 italic">"{matrix.claim}"</p>
              </div>
              <div className="transition-all duration-300">
                <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px]">Sokratik Karşı Tez:</span>
                <p className="bg-slate-950 p-2.5 rounded-lg mt-1 text-slate-300 border border-slate-800 leading-relaxed">{matrix.counterClaim}</p>
              </div>
              <div className="transition-all duration-300">
                <span className="text-rose-400 font-semibold uppercase tracking-wider text-[10px]">Neyin Kanıtı Değildir?</span>
                <p className="bg-slate-950 p-2.5 rounded-lg mt-1 text-slate-300 border border-slate-800 leading-relaxed">{matrix.notProof}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3 border border-slate-700/60">
                <Brain className="w-6 h-6 text-cyan-400/60" />
              </div>
              <p className="text-slate-400 text-xs leading-relaxed px-4">
                Sol paneldeki kutuya felsefi veya bilimsel bir savınızı girip gönderdiğinizde, sistem buraya otomatik olarak o iddianın epistemolojik analiz matrisini çıkaracaktır.
              </p>
            </div>
          )}
        </div>
        
        {matrix && (
          <button 
            onClick={copyToClipboard}
            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 py-2.5 rounded-lg text-xs font-bold text-white tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Panoya Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Matrisi Panoya Kopyala</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
