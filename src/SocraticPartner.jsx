import React, { useState, useRef, useEffect, useCallback } from 'react';

const SOCRATIC_UI = {
  tr: {
    labTitle: 'Sokratik Diyalog Laboratuvarı',
    welcome: 'Merhaba, ben Sokratik Düşünce Partneriniz. Bugün üzerine kafa yormak istediğiniz, doğruluğundan kesinlikle emin olduğunuz o sarsılmaz iddia veya fikir nedir?',
    thinking: 'Sokratik süzgeçten geçiriliyor...',
    placeholder: 'İddianızı, fikrinizi veya sarsılmaz kabul ettiğiniz bir tezi yazın...',
    sendBtn: 'Sorgula',
    filterTitle: 'Epistemik Süzgeç',
    yourClaim: 'Senin İddian:',
    counterThesis: 'Sokratik Karşı Tez:',
    notProofLabel: 'Neyin Kanıtı Değildir?:',
    emptyPrompt: 'Yandaki kutuya felsefi veya bilimsel bir iddianızı girip gönderdiğinizde, sistem buraya otomatik olarak o iddianın epistemolojik analiz matrisini çıkaracaktır.',
    copyBtn: 'Matrisi Panoya Kopyala',
    copiedAlert: 'Analiz matrisi panoya kopyalandı!',
    fallbacks: [
      'İddianız oldukça merak uyandırıcı. Ancak şu noktayı düşünmenizi rica ediyorum: Bu önermenin temelinde yatan ve henüz sorgulamadığınız o en büyük ön kabul nedir?',
      'Bu argüman ilk bakışta çok tutarlı görünüyor. Peki, iddia ettiğiniz durumun tam tersini gösteren tek bir istisna dahi olsaydı, kurduğunuz tüm bu mantık zinciri nasıl etkilenirdi?',
      'Düşüncenizin arkasındaki motivasyonu anlıyorum. Peki, bu yargıya varırken kullandığınız kavramsal tanımların kişisel deneyimlerinizin ötesinde, nesnel bir geçerliliği var mı?'
    ],
    defaultCounter: 'Bu durumun sadece gözlemcinin öznel algısına, dilsel sınırlarına veya sınırlı veri setine bağlı bir korelasyon olması ihtimali.',
    defaultNotProof: 'Gözlemlenen pratik tutarlılık veya çoğunluğun mutabakatı, mutlak bir nedenselliğin ya da değişmez bir doğrunun kanıtı değildir.'
  },
  en: {
    labTitle: 'Socratic Dialogue Laboratory',
    welcome: 'Hello, I am your Socratic Thought Partner. What is that unshakeable claim or idea you are certain of and wish to reflect upon today?',
    thinking: 'Passing through the Socratic filter...',
    placeholder: 'Write your claim, idea, or a thesis you consider unshakeable...',
    sendBtn: 'Inquire',
    filterTitle: 'Epistemic Filter',
    yourClaim: 'Your Claim:',
    counterThesis: 'Socratic Counter-Thesis:',
    notProofLabel: 'What Is It Not Proof Of?:',
    emptyPrompt: 'When you enter and submit a philosophical or scientific claim in the box beside this, the system will automatically generate its epistemological analysis matrix here.',
    copyBtn: 'Copy Matrix to Clipboard',
    copiedAlert: 'Analysis matrix copied to clipboard!',
    fallbacks: [
      'Your claim is quite intriguing. However, I ask you to consider this: What is the largest unexamined presupposition underlying this proposition?',
      'This argument appears very consistent at first glance. Yet if there were even a single exception demonstrating the exact opposite, how would your entire chain of logic be affected?',
      'I understand the motivation behind your thought. But do the conceptual definitions you used to reach this judgment hold objective validity beyond personal experience?'
    ],
    defaultCounter: "The possibility that this situation is merely a correlation bound to the observer's subjective perception, linguistic limits, or finite dataset.",
    defaultNotProof: 'Observed practical consistency or majority consensus is not proof of absolute causality or an immutable truth.'
  },
  de: {
    labTitle: 'Sokratisches Dialoglabor',
    welcome: 'Hallo, ich bin Ihr sokratischer Denkpartner. Was ist jene unerschütterliche Behauptung oder Idee, über die Sie heute nachdenken möchten?',
    thinking: 'Wird durch den sokratischen Filter geprüft...',
    placeholder: 'Schreiben Sie Ihre Behauptung, Idee oder eine These...',
    sendBtn: 'Hinterfragen',
    filterTitle: 'Epistemischer Filter',
    yourClaim: 'Ihre Behauptung:',
    counterThesis: 'Sokratische Gegenthese:',
    notProofLabel: 'Wofür ist es kein Beweis?:',
    emptyPrompt: 'Wenn Sie links eine philosophische oder wissenschaftliche Behauptung eingeben, erstellt das System hier automatisch die epistemologische Analysematrix.',
    copyBtn: 'Matrix in Zwischenablage kopieren',
    copiedAlert: 'Analysematrix in die Zwischenablage kopiert!',
    fallbacks: [
      'Ihre Behauptung ist äußerst interessant. Doch bedenken Sie bitte: Was ist die größte, noch ungeprüfte Grundannahme hinter dieser Aussage?',
      'Dieses Argument wirkt auf den ersten Blick sehr schlüssig. Wie würde sich Ihre gesamte Logikkette verändern, wenn es auch nur eine einzige Ausnahme gäbe?',
      'Ich verstehe die Motivation hinter Ihrem Gedanken. Haben die begrifflichen Definitionen, die Sie verwenden, eine objektive Gültigkeit jenseits persönlicher Erfahrung?'
    ],
    defaultCounter: 'Die Möglichkeit, dass dieser Zustand lediglich eine Korrelation ist, die an die subjektive Wahrnehmung oder sprachliche Grenzen gebunden ist.',
    defaultNotProof: 'Beobachtete praktische Konsistenz oder Mehrheitskonsens sind kein Beweis für absolute Kausalität oder unveränderliche Wahrheit.'
  },
  fr: {
    labTitle: 'Laboratoire de Dialogue Socratique',
    welcome: "Bonjour, je suis votre partenaire de réflexion socratique. Quelle est cette affirmation ou idée inébranlable sur laquelle vous souhaitez méditer aujourd'hui ?",
    thinking: 'Analyse à travers le filtre socratique...',
    placeholder: 'Écrivez votre affirmation, votre idée ou une thèse...',
    sendBtn: 'Interroger',
    filterTitle: 'Filtre Épistémique',
    yourClaim: 'Votre Affirmation :',
    counterThesis: 'Contre-thèse Socratique :',
    notProofLabel: "De quoi n'est-ce pas la preuve ? :",
    emptyPrompt: "Lorsque vous soumettez une affirmation philosophique ou scientifique, le système génère automatiquement sa matrice d'analyse épistémologique ici.",
    copyBtn: 'Copier la Matrice',
    copiedAlert: 'Matrice copiée dans le presse-papiers !',
    fallbacks: [
      'Votre affirmation est très intrigante. Toutefois, quel est le plus grand présupposé non examiné qui sous-tend cette proposition ?',
      "Cet argument semble très cohérent à première vue. Mais s'il existait une seule exception démontrant le contraire, comment votre chaîne logique serait-elle affectée ?",
      "Je comprends la motivation derrière votre pensée. Mais les définitions conceptuelles utilisées ont-elles une validité objective au-delà de l'expérience personnelle ?"
    ],
    defaultCounter: "La possibilité que cette situation ne soit qu'une corrélation liée à la perception subjective de l'observateur ou aux limites du langage.",
    defaultNotProof: "La cohérence pratique observée ou le consensus majoritaire n'est pas la preuve d'une causalité absolue."
  },
  es: {
    labTitle: 'Laboratorio de Diálogo Socrático',
    welcome: 'Hola, soy tu compañero de pensamiento socrático. ¿Cuál es esa afirmación o idea inquebrantable sobre la que deseas reflexionar hoy?',
    thinking: 'Pasando por el filtro socrático...',
    placeholder: 'Escribe tu afirmación, idea o tesis...',
    sendBtn: 'Cuestionar',
    filterTitle: 'Filtro Epistémico',
    yourClaim: 'Tu Afirmación:',
    counterThesis: 'Contratesis Socrática:',
    notProofLabel: '¿De qué no es prueba?:',
    emptyPrompt: 'Cuando ingreses una afirmación filosófica o científica en el cuadro contiguo, el sistema generará automáticamente su matriz de análisis epistemológico aquí.',
    copyBtn: 'Copiar Matriz al Portapapeles',
    copiedAlert: '¡Matriz copiada al portapapeles!',
    fallbacks: [
      'Tu afirmación es muy intrigante. Sin embargo, te pido que consideres esto: ¿cuál es el mayor presupuesto no cuestionado que subyace a esta proposición?',
      'Este argumento parece muy coherente a primera vista. Pero si existiera una sola excepción que demostrara lo contrario, ¿cómo se vería afectada toda tu cadena lógica?',
      'Entiendo la motivación detrás de tu pensamiento. ¿Pero las definiciones conceptuales que utilizas tienen validez objetiva más allá de la experiencia personal?'
    ],
    defaultCounter: 'La posibilidad de que esta situación sea solo una correlación ligada a la percepción subjetiva del observador o a límites lingüísticos.',
    defaultNotProof: 'La consistencia práctica observada o el consenso de la mayoría no es prueba de una causalidad absoluta.'
  }
};

async function translateDynamicText(text, targetLang) {
  if (!text || !text.trim()) return text;
  if (typeof window !== 'undefined' && window.SciPhilLanguageSync?.translateNaturalText) {
    return window.SciPhilLanguageSync.translateNaturalText(text, targetLang);
  }
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    return Array.isArray(data?.[0]) ? data[0].map(s => s?.[0] || '').join('') : text;
  } catch {
    return text;
  }
}

export default function SocraticPartner({ lang: propLang }) {
  const resolveInitialLang = () => {
    const raw = propLang || (typeof document !== 'undefined' ? document.documentElement.lang : '') || 'tr';
    const short = String(raw).toLowerCase().slice(0, 2);
    return SOCRATIC_UI[short] ? short : 'tr';
  };

  const [activeLang, setActiveLang] = useState(resolveInitialLang);
  const ui = SOCRATIC_UI[activeLang] || SOCRATIC_UI.tr;

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: ui.welcome,
      isWelcome: true
    }
  ]);
  const [input, setInput] = useState('');
  const [matrix, setMatrix] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const syncLanguageSimultaneously = useCallback(async (newLang) => {
    const clean = String(newLang || 'tr').toLowerCase().slice(0, 2);
    const targetUi = SOCRATIC_UI[clean] || SOCRATIC_UI.en;
    setActiveLang(clean);

    const translatedMessagesPromise = Promise.all(
      messages.map(async (m) => {
        if (m.isWelcome) {
          return { ...m, text: targetUi.welcome };
        }
        const translatedText = await translateDynamicText(m.originalText || m.text, clean);
        return { ...m, originalText: m.originalText || m.text, text: translatedText };
      })
    );

    const translatedMatrixPromise = matrix
      ? Promise.all([
          translateDynamicText(matrix.originalClaim || matrix.claim, clean),
          translateDynamicText(matrix.originalCounterClaim || matrix.counterClaim, clean),
          translateDynamicText(matrix.originalNotProof || matrix.notProof, clean)
        ]).then(([claim, counterClaim, notProof]) => ({
          ...matrix,
          originalClaim: matrix.originalClaim || matrix.claim,
          originalCounterClaim: matrix.originalCounterClaim || matrix.counterClaim,
          originalNotProof: matrix.originalNotProof || matrix.notProof,
          claim,
          counterClaim,
          notProof
        }))
      : Promise.resolve(null);

    const [updatedMsgs, updatedMat] = await Promise.all([
      translatedMessagesPromise,
      translatedMatrixPromise
    ]);

    setMessages(updatedMsgs);
    if (updatedMat) setMatrix(updatedMat);
  }, [messages, matrix]);

  useEffect(() => {
    if (propLang) {
      const short = String(propLang).toLowerCase().slice(0, 2);
      if (short !== activeLang) {
        syncLanguageSimultaneously(short);
      }
    }
  }, [propLang, activeLang, syncLanguageSimultaneously]);

  useEffect(() => {
    const handleGlobalLangChange = (e) => {
      const nextLang = e?.detail?.lang;
      if (nextLang && nextLang !== activeLang) {
        syncLanguageSimultaneously(nextLang);
      }
    };
    window.addEventListener('sciphil:language-change', handleGlobalLangChange);
    return () => window.removeEventListener('sciphil:language-change', handleGlobalLangChange);
  }, [activeLang, syncLanguageSimultaneously]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { sender: 'user', text: trimmed, originalText: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: trimmed,
          lang: activeLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || data.question || ui.fallbacks[0];
        setMessages(prev => [...prev, { sender: 'bot', text: replyText, originalText: replyText }]);
        setMatrix({
          claim: data.matrix?.claim || trimmed,
          counterClaim: data.matrix?.counterClaim || ui.defaultCounter,
          notProof: data.matrix?.notProof || ui.defaultNotProof,
          originalClaim: data.matrix?.claim || trimmed,
          originalCounterClaim: data.matrix?.counterClaim || ui.defaultCounter,
          originalNotProof: data.matrix?.notProof || ui.defaultNotProof
        });
        setIsLoading(false);
        return;
      }
    } catch {
      // Sunucu yanıt vermezse doğrudan çok dilli kuralsal Sokratik yanıta geç
    }

    const randomResponse = ui.fallbacks[Math.floor(Math.random() * ui.fallbacks.length)];
    setMessages(prev => [...prev, { sender: 'bot', text: randomResponse, originalText: randomResponse }]);
    setMatrix({
      claim: trimmed,
      counterClaim: ui.defaultCounter,
      notProof: ui.defaultNotProof,
      originalClaim: trimmed,
      originalCounterClaim: ui.defaultCounter,
      originalNotProof: ui.defaultNotProof
    });
    setIsLoading(false);
  };

  const copyToClipboard = async () => {
    if (!matrix) return;
    const textToCopy = `[${ui.filterTitle.toUpperCase()}]\n\n${ui.yourClaim}\n${matrix.claim}\n\n${ui.counterThesis}\n${matrix.counterClaim}\n\n${ui.notProofLabel}\n${matrix.notProof}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopyFeedback(ui.copiedAlert);
      setTimeout(() => setCopyFeedback(''), 2500);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto bg-slate-950 text-slate-100 rounded-xl min-h-[550px] font-sans shadow-2xl border border-slate-800/50">
      <div className="flex-1 flex flex-col justify-between bg-slate-900/80 p-5 rounded-lg border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse"></div>
          <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
            {ui.labTitle}
          </h2>
        </div>

        <div className="overflow-y-auto h-96 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
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
                <span className="text-xs italic">{ui.thinking}</span>
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
            placeholder={ui.placeholder}
            className="flex-1 p-3 bg-slate-950 rounded border border-slate-800 text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder-slate-600 text-slate-100"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 px-5 py-3 rounded text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            {ui.sendBtn}
          </button>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-900/80 p-5 rounded-lg border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <span className="text-lg">⚖️</span>
            <h3 className="text-sky-400 font-bold text-sm tracking-wide uppercase">
              {ui.filterTitle}
            </h3>
          </div>

          {matrix ? (
            <div className="space-y-4 text-xs">
              <div className="transition-all duration-300 ease-in-out">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  {ui.yourClaim}
                </span>
                <p className="bg-slate-950/80 p-2.5 rounded mt-1 text-slate-300 border border-slate-900 italic">
                  "{matrix.claim}"
                </p>
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px]">
                  {ui.counterThesis}
                </span>
                <p className="bg-slate-950/80 p-2.5 rounded mt-1 text-slate-300 border border-slate-900">
                  {matrix.counterClaim}
                </p>
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <span className="text-rose-400 font-semibold uppercase tracking-wider text-[10px]">
                  {ui.notProofLabel}
                </span>
                <p className="bg-slate-950/80 p-2.5 rounded mt-1 text-slate-300 border border-slate-900">
                  {matrix.notProof}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-3xl mb-3 opacity-30">🔍</span>
              <p className="text-slate-500 text-xs italic leading-relaxed px-4">
                {ui.emptyPrompt}
              </p>
            </div>
          )}
        </div>

        {matrix && (
          <div>
            {copyFeedback && (
              <p className="text-emerald-400 text-[11px] text-center mb-2 font-medium">
                {copyFeedback}
              </p>
            )}
            <button
              onClick={copyToClipboard}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 py-2.5 rounded text-xs font-bold text-white tracking-wider uppercase transition-all shadow-md"
            >
              {ui.copyBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}