import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  Globe, 
  Sparkles,
  BookmarkCheck,
  Code2
} from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  canonicalUrl?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  canonicalUrl = 'https://sci-phil.ai.studio'
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const shareTitle = 'Science & Philosophy | Emre Pelit';
  const shareDescription = 'Emre Pelit tarafından kaleme alınan 70 orijinal Türkçe bilim ve zihin felsefesi makalesi, evrensel çok dilli akademik çeviri ve interaktif diyalektik düşünce laboratuvarı sci-phil.ai.studio adresinde yayında!';

  // Pre-formatted social share intents
  const socialNetworks = [
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      color: 'bg-black text-white hover:bg-neutral-800 border-neutral-700',
      shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(
        'Emre Pelit’in bilim, zihin felsefesi, yapay zekâ bilinci ve kuantum kozmolojisi külliyatı: 70 orijinal Türkçe makale ve çok dilli akademik inceleme portalı sci-phil.ai.studio’da yayında!'
      )}&hashtags=${encodeURIComponent('Bilim,Felsefe,ZihinFelsefesi,Kozmoloji,YapayZeka,EmrePelit')}`,
    },
    {
      name: 'LinkedIn',
      icon: 'in',
      color: 'bg-[#0077b5] text-white hover:bg-[#006097] border-[#006097]',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`,
    },
    {
      name: 'Facebook',
      icon: 'f',
      color: 'bg-[#1877f2] text-white hover:bg-[#0d65d9] border-[#0d65d9]',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: 'WA',
      color: 'bg-[#25d366] text-white hover:bg-[#20ba59] border-[#20ba59]',
      shareUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        'Science & Philosophy • Emre Pelit Külliyatı:\n' + shareDescription + '\n\nİncelemek için: ' + canonicalUrl
      )}`,
    },
    {
      name: 'Telegram',
      icon: 'TG',
      color: 'bg-[#229ed9] text-white hover:bg-[#1b88bc] border-[#1b88bc]',
      shareUrl: `https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(shareDescription)}`,
    },
    {
      name: 'Reddit',
      icon: 'r/',
      color: 'bg-[#ff4500] text-white hover:bg-[#d83a00] border-[#d83a00]',
      shareUrl: `https://www.reddit.com/submit?url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent('Science & Philosophy: Emre Pelit Bilim ve Zihin Felsefesi Külliyatı')}`,
    },
  ];

  // Tailored Announcement Notes
  const generalNoticeTr = `📢 BİLGİ NOTU & DUYURU:

Bilim, zihin felsefesi, yapay zekâ bilinci, zamanın simülasyon mekaniği ve kuantum kozmolojisi üzerine kaleme aldığım 70 orijinal Türkçe makaleden oluşan külliyatım, resmi ana otorite adresi olan https://sci-phil.ai.studio üzerinde yayına alınmıştır.

Portalda yer alan özellikler:
• 70 Orijinal Türkçe Makale (Büyük Dil Modelleri’nden nöronal zaman algısına, Higgs bozonundan döngüsel evren modeline kadar)
• Evrensel Çok Dilli İnceleme (10 dünya dilinde akademik çeviri ve doğal seslendirme)
• Diyalektik Üçlü (İddia • Karşı İddia • Sahte Delil Ayıklaması)
• İnteraktif Felsefe ve Bilim Simülasyonları

Tüm akademik ve düşünsel araştırmacıların incelemesine sunulur:
🔗 https://sci-phil.ai.studio`;

  const academicNotice = `AKADEMİK & TOPLULUK TANITIM BİLGİ NOTU:
Yazar: Emre Pelit
Külliyat: Science & Philosophy (Bilim, Zihin Felsefesi ve Kozmoloji Araştırmaları)
Kanonik Adres: https://sci-phil.ai.studio
Yazar Profilleri:
• ResearchGate: https://www.researchgate.net/profile/Emre-Pelit?ev=hdr_xprf
• Medium: https://medium.com/@emrepelit39
• LinkedIn: https://www.linkedin.com/in/emrepelit109

Özet:
Bu çalışma; Büyük Dil Modellerinin (LLM) ontolojisi, fenomenal bilinç (qualia), nöronal zaman algısı, blok evren teorisi, kuantum dolanıklığı ve döngüsel evren modelleri üzerine 70 özgün Türkçe makaleyi ve bunların akademik çok dilli açılımlarını içermektedir. Tam metinlere ve diyalektik analizlere https://sci-phil.ai.studio üzerinden erişebilirsiniz.`;

  const blogBacklinkHtml = `<!-- Blogger ve Web Siteleri İçin Doğal İç Linkleme Kodu -->
<div style="margin:24px 0;padding:16px;border:1px solid #d4af37;border-radius:12px;background:#0f172a;color:#f8fafc;font-family:sans-serif;">
  <p style="margin:0 0 8px 0;font-weight:bold;color:#f59e0b;">📚 Science &amp; Philosophy Resmi Külliyatı</p>
  <p style="margin:0;font-size:14px;line-height:1.6;">
    Yazar Emre Pelit'in tüm makaleleri, diyalektik tez-antitez analizleri ve çok dilli akademik çevirileri için ana portalı ziyaret edin: 
    <a href="https://sci-phil.ai.studio" target="_blank" rel="noopener" style="color:#38bdf8;font-weight:bold;text-decoration:underline;">https://sci-phil.ai.studio</a>
  </p>
</div>`;

  const englishNotice = `ANNOUNCEMENT: Science & Philosophy by Emre Pelit
A comprehensive scientific and philosophical treatise archive exploring the ontology of Large Language Models (LLM), phenomenal consciousness, neural time perception, and quantum cosmology.
Explore 70 peerless treatises with multilingual academic translations and interactive dialectical inquiry:
👉 https://sci-phil.ai.studio`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-title text-neutral-900 dark:text-neutral-100">
              Sosyal Medya &amp; Topluluk Paylaşım Merkezi
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              https://sci-phil.ai.studio adresini tüm hesaplarınızda hazır bilgi notlarıyla tek tıkla paylaşın
            </p>
          </div>
        </div>

        {/* 1-Click Social Media Launchers */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
              1. Tüm Sosyal Medya Hesaplarında Tek Tıkla Paylaş
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              Doğrudan Paylaşım Linkleri
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {socialNetworks.map((net) => (
              <a
                key={net.name}
                href={net.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${net.color}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{net.icon}</span>
                  <span>{net.name}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            ))}
          </div>
        </div>

        {/* Ready-to-copy Announcement Notices (Bilgi Notları) */}
        <div className="space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
            2. Kopyalanabilir Bilgi Notları &amp; Duyuru Metinleri
          </span>

          {/* General Social Notice */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Genel Sosyal Medya Duyuru Metni (Türkçe)</span>
              </span>
              <button
                onClick={() => handleCopy('generalTr', generalNoticeTr)}
                className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedKey === 'generalTr' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-950" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-sans text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              {generalNoticeTr}
            </pre>
          </div>

          {/* Academic & Community Notice */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Akademik Topluluklar (ResearchGate / Medium / Forumlar)</span>
              </span>
              <button
                onClick={() => handleCopy('academic', academicNotice)}
                className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedKey === 'academic' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-sans text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              {academicNotice}
            </pre>
          </div>

          {/* Blogger & Site Backlink HTML Snippet */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Blogger / science-philosophy.grok.me İç Linkleme HTML Kodu</span>
              </span>
              <button
                onClick={() => handleCopy('backlink', blogBacklinkHtml)}
                className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedKey === 'backlink' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>HTML'i Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              {blogBacklinkHtml}
            </pre>
          </div>

          {/* English Announcement */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>Global English Announcement</span>
              </span>
              <button
                onClick={() => handleCopy('enNotice', englishNotice)}
                className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedKey === 'enNotice' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-sans text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              {englishNotice}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>Otorite Canonical Domain: <strong className="text-neutral-800 dark:text-neutral-200 font-mono">sci-phil.ai.studio</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
