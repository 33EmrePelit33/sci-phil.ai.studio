import React, { useMemo, useState } from 'react';
import { Article } from '../types/article';
import { ArrowDown, ArrowUp, BriefcaseBusiness, CheckCircle2, ClipboardCheck, FlaskConical, ShieldAlert } from 'lucide-react';

interface ProfessionalEvaluationProps {
  article: Article;
  /** Compact mode is used on the article-directory cards. */
  compact?: boolean;
}

interface EvaluationLens {
  role: string;
  focus: string;
  assessment: string;
  checks: string[];
  nextStep: string;
}

interface DomainProfile {
  name: string;
  roles: [string, string, string];
  focus: [string, string, string];
  practical: string;
  evidence: string;
  safeguards: string;
  metric: string;
  limitation: string;
}

const DOMAIN_PROFILES: Record<string, DomainProfile> = {
  ai: {
    name: 'Yapay zekâ ve dijital teknoloji',
    roles: ['Yapay zekâ ürün / makine öğrenmesi mühendisi', 'Araştırma ve değerlendirme uzmanı', 'Yapay zekâ güvenliği ve yönetişimi uzmanı'],
    focus: ['Üründe uygulanabilirlik', 'İddia ile ölçülebilir kanıt arasındaki bağ', 'Güvenli ve sorumlu kullanım'],
    practical: 'iddianın gerçek bir ürün veya iş akışında hangi kararı değiştirdiği ve bunun kullanıcı için ölçülebilir fayda üretip üretmediği',
    evidence: 'gösterilen model davranışının hangi test seti, karşılaştırma tabanı ve tekrar edilebilir deneyle desteklendiği',
    safeguards: 'hata türleri, veri mahremiyeti, önyargı, insan denetimi ve başarısız durumda geri dönüş planı',
    metric: 'temsilî görevlerde doğruluk, tutarlılık, maliyet, gecikme ve hata sonrası toparlanma',
    limitation: 'Akıcı veya ikna edici çıktı tek başına bilinç, anlayış ya da genel güvenilirlik kanıtı sayılmaz; her iddia kendi ölçütüyle sınanmalıdır.',
  },
  physics: {
    name: 'Fizik, matematik ve temel bilimler',
    roles: ['Kuramsal fizik / modelleme uzmanı', 'Deneysel yöntem ve ölçüm uzmanı', 'Bilim-teknoloji uygulamaları uzmanı'],
    focus: ['Modelin varsayımları ve sınırları', 'Ölçüm, veri ve bağımsız doğrulama', 'Kuramdan uygulamaya geçiş'],
    practical: 'tezin mevcut modellerden hangi noktada ayrıldığı, hangi koşullarda öngörü ürettiği ve bilinen sonuçlarla çelişip çelişmediği',
    evidence: 'matematiksel tutarlılığın, gözlemsel desteğin ve deneysel doğrulamanın birbirinden ayrı değerlendirilmesi',
    safeguards: 'ölçüm belirsizliği, alternatif açıklamalar, ölçek farkları ve modelin geçerli olduğu sınırlar',
    metric: 'önceden belirtilmiş tahminlerin ölçüm belirsizliği içinde tekrarlanabilmesi ve bağımsız veriye uyum',
    limitation: 'Kavramsal bir yorum veya matematiksel olarak mümkün bir model, tek başına doğanın o şekilde işlediğini kanıtlamaz.',
  },
  health: {
    name: 'Sağlık ve yaşam bilimleri',
    roles: ['Sağlık alanı uygulama uzmanı', 'Klinik / bilimsel kanıt değerlendirme uzmanı', 'Biyoetik ve risk yönetimi uzmanı'],
    focus: ['Sahadaki fayda ve uygulanabilirlik', 'Kanıt düzeyi ve alternatif açıklamalar', 'Güvenlik, etik ve eşit erişim'],
    practical: 'iddianın hedeflenen kişi veya grupta hangi sonucu iyileştirdiği, mevcut uygulamaya kıyasla anlamlı bir fark sağlayıp sağlamadığı',
    evidence: 'korelasyon ile nedenselliğin ayrılması, çalışma tasarımı, örneklem seçimi, etki büyüklüğü ve bağımsız tekrar',
    safeguards: 'yan etkiler, yanlış uygulama riski, onam, mahremiyet ve farklı gruplarda değişen sonuçlar',
    metric: 'önceden tanımlı sonuç ölçütleri, zarar-fayda dengesi ve bağımsız doğrulama',
    limitation: 'Genel bir kuramsal sav, kişiye özgü tanı veya tedavi önerisine doğrudan çevrilemez; klinik iddialar uygun kanıt ve uzman incelemesi gerektirir.',
  },
  economy: {
    name: 'Ekonomi, işletme ve çalışma hayatı',
    roles: ['Ekonomik analiz / iş stratejisi uzmanı', 'Veri ve etki değerlendirme uzmanı', 'Operasyon ve politika uygulama uzmanı'],
    focus: ['Teşvikler ve uygulanabilirlik', 'Veri, karşılaştırma ve nedensellik', 'Dağılım etkisi ve operasyonel risk'],
    practical: 'iddianın maliyetleri, teşvikleri ve karar mekanizmasını nasıl değiştirdiği; kısa vadeli kazancın uzun vadeli sonuçlarla dengelenmesi',
    evidence: 'seçilmiş örneklerle genel eğilimlerin ayrılması, karşılaştırma grubunun belirlenmesi ve alternatif nedenlerin kontrol edilmesi',
    safeguards: 'kazanç ve kayıpların farklı gruplara dağılımı, belirsizlik, teşvik uyumsuzluğu ve beklenmeyen ikinci derece etkiler',
    metric: 'başlangıç değeriyle karşılaştırılan sonuçlar, toplam maliyet, duyarlılık analizi ve farklı senaryolardaki performans',
    limitation: 'Bir örnekte işe yarayan yaklaşım her sektöre veya ölçeğe genellenemez; bağlam ve fırsat maliyeti hesaba katılmalıdır.',
  },
  education: {
    name: 'Eğitim ve öğrenme bilimleri',
    roles: ['Eğitim tasarımı / saha uygulama uzmanı', 'Ölçme ve değerlendirme uzmanı', 'Eğitim etiği ve erişilebilirlik uzmanı'],
    focus: ['Öğrenme sürecine katkı', 'Öğrenme çıktılarının geçerli ölçümü', 'Erişim, mahremiyet ve öğretmen rolü'],
    practical: 'yaklaşımın yalnızca görevi kolaylaştırıp kolaylaştırmadığı değil, öğrencinin kalıcı öğrenmesini ve farklı ihtiyaçlara uyumunu geliştirip geliştirmediği',
    evidence: 'ön test-son test, uygun karşılaştırma, gecikmeli hatırlama ve farklı öğrenci gruplarından toplanan veriler',
    safeguards: 'erişim eşitsizliği, değerlendirme adaleti, öğrenci verilerinin korunması ve öğretmenin pedagojik karar yetkisi',
    metric: 'kalıcı öğrenme, transfer becerisi, katılım ve farklı gruplar arasındaki sonuç farkları',
    limitation: 'Kısa süreli başarı veya memnuniyet, tek başına derin ve kalıcı öğrenmeyi göstermez.',
  },
  environment: {
    name: 'Çevre, enerji ve sürdürülebilirlik',
    roles: ['Çevre / enerji sistemleri uzmanı', 'Etki ve yaşam döngüsü değerlendirme uzmanı', 'Kamu politikası ve uygulama uzmanı'],
    focus: ['Sistem düzeyinde etki', 'Ölçüm sınırları ve yaşam döngüsü', 'Geçiş maliyeti ve adil uygulama'],
    practical: 'önerinin tüm sistem üzerindeki net etkisi; bir aşamada elde edilen faydanın başka bir yerde maliyet veya emisyon yaratıp yaratmadığı',
    evidence: 'ölçüm sınırları, başlangıç senaryosu, zaman ufku ve doğrudan-dolaylı etkilerin ayrı raporlanması',
    safeguards: 'kaynak kullanımı, geri tepme etkisi, yerel topluluklar ve maliyetlerin eşitsiz dağılması',
    metric: 'yaşam döngüsü boyunca net etki, belirsizlik aralığı, maliyet ve uzun dönem performansı',
    limitation: 'Tek bir çevresel gösterge veya kısa dönemli kazanım, toplam sürdürülebilirliği tek başına temsil etmez.',
  },
  society: {
    name: 'Toplum, siyaset ve kurumlar',
    roles: ['Kamu politikası / kurum uygulama uzmanı', 'Sosyal araştırma ve veri analizi uzmanı', 'Hukuk, haklar ve etik uyum uzmanı'],
    focus: ['Uygulama koşulları ve kurumsal teşvikler', 'Toplumsal verinin temsiliyeti', 'Haklar, hesap verebilirlik ve yan etkiler'],
    practical: 'tezin gerçek kurumlardaki teşvikler, uygulama kapasitesi ve farklı paydaşların davranışları altında nasıl sonuç vereceği',
    evidence: 'örneklemin temsiliyeti, karşılaştırmalı vakalar, tarihsel bağlam ve alternatif nedenlerin hesaba katılması',
    safeguards: 'hak kaybı, ayrımcı etki, güç yoğunlaşması ve kararların denetlenebilirliği',
    metric: 'farklı gruplar için ayrı raporlanan sonuçlar, uygulama maliyeti, şeffaflık ve bağımsız gözetim',
    limitation: 'Tek bir tarihsel örnek veya normatif sav, farklı toplum ve kurumlarda aynı sonucu garanti etmez.',
  },
  philosophy: {
    name: 'Felsefe, etik ve kavramsal analiz',
    roles: ['Felsefi argümantasyon / kavram analizi uzmanı', 'Bilim felsefesi ve yöntem değerlendirme uzmanı', 'Etik ve politika uygulama uzmanı'],
    focus: ['Kavramların açıklığı ve çıkarım geçerliliği', 'Karşı örnekler ve kanıt standardı', 'Pratik sonuçlar ve değer çatışmaları'],
    practical: 'tezin temel kavramlarının açıkça tanımlanması, öncüllerin sonucu gerçekten desteklemesi ve sonucun hangi kapsamda savunulduğu',
    evidence: 'tanım, mantıksal çıkarım, düşünce deneyi ve ampirik iddiaların birbirine karıştırılmaması',
    safeguards: 'karşı örnekler, gizli varsayımlar, kavram kaymaları ve aynı olguyu açıklayan rakip yaklaşımlar',
    metric: 'öncüllerin açıkça belirtilebilmesi, itirazlara dayanıklılık ve farklı örneklere tutarlı uygulanma',
    limitation: 'Bir görüşün tutarlı veya sezgisel açıdan güçlü olması, ampirik öncüllerinin doğru olduğunu tek başına göstermez.',
  },
  general: {
    name: 'Disiplinler arası araştırma ve uygulama',
    roles: ['Alan uygulaması / süreç tasarımı uzmanı', 'Araştırma yöntemi ve kanıt değerlendirme uzmanı', 'Risk, etik ve etki değerlendirme uzmanı'],
    focus: ['Gerçek bağlamda uygulanabilirlik', 'Tezi destekleyen verilerin gücü', 'Beklenmeyen sonuçlar ve sorumlu kullanım'],
    practical: 'iddianın mevcut uygulamaya göre hangi somut kararı iyileştirdiği ve bunun hangi koşullarda geçerli olduğu',
    evidence: 'iddia, örnek, yorum ve bağımsız doğrulamanın açık biçimde ayrılması',
    safeguards: 'yanlış genelleme, çıkar çatışması, yan etkiler ve başarısızlık durumunda izlenecek yol',
    metric: 'önceden belirlenen başarı ölçütleri, şeffaf varsayımlar ve bağımsız olarak tekrarlanabilir sonuçlar',
    limitation: 'Tezin ikna edici anlatılması, tek başına doğruluğuna veya her bağlamda uygulanabilirliğine kanıt değildir.',
  },
};

const stripMarkup = (value: string | undefined): string => (value || '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, ' ')
  .trim();

const clip = (value: string, max = 300): string => {
  const normalized = value.trim();
  if (normalized.length <= max) return normalized;
  const lastSpace = normalized.lastIndexOf(' ', max - 1);
  return `${normalized.slice(0, lastSpace > max * 0.65 ? lastSpace : max).trim()}…`;
};

function selectDomain(text: string): DomainProfile {
  const t = text.toLocaleLowerCase('tr-TR');
  if (/yapay zek|\bllm\b|büyük dil model|makine öğren|algoritma|robot|dijital zihin|üretken yapay|generative ai|artificial intelligence/.test(t)) return DOMAIN_PROFILES.ai;
  if (/kuantum|fizik|evren|kozmolo|entropi|görelilik|zaman oku|uzay-zaman|parçacık|yerçekim|kütleçekim|nötron yıldız|karanlık madde/.test(t)) return DOMAIN_PROFILES.physics;
  if (/sağlık|hastalık|klinik|tedavi|tıp|ilaç|biyoloji|nörobiy|beyin|nöron|genetik|psikiyatri|psikoloji|hasta/.test(t)) return DOMAIN_PROFILES.health;
  if (/ekonomi|ekonomik|finans|sermaye|piyasa|işletme|üretim maliyeti|emek piyasası|enflasyon|gelir dağılım/.test(t)) return DOMAIN_PROFILES.economy;
  if (/eğitim|öğrenme|öğretim|pedagoji|okul|üniversite|öğrenci|müfredat|öğretmen/.test(t)) return DOMAIN_PROFILES.education;
  if (/iklim|çevre|enerji|sürdürülebilir|karbon|ekoloji|yenilenebilir|biyoçeşitlilik|atık yönetim/.test(t)) return DOMAIN_PROFILES.environment;
  if (/siyaset|politik|toplum|toplumsal|demokrasi|devlet|kurum|sosyoloji|eşitsizlik|haklar|hukuk|adalet|yönetişim/.test(t)) return DOMAIN_PROFILES.society;
  if (/felsefe|etik|ahlak|ontoloji|epistemoloji|özgür irade|metafizik|varoluş|bilgi kuram|bilinç|şuur|gerçeklik|determinizm|öznel deneyim/.test(t)) return DOMAIN_PROFILES.philosophy;
  return DOMAIN_PROFILES.general;
}

function buildEvaluation(article: Article) {
  const summary = stripMarkup(article.summary);
  const fullContent = stripMarkup(article.content).slice(0, 14000);
  const claim = stripMarkup(article.dialecticalTriad?.claim) || summary || article.title;
  const counterClaim = stripMarkup(article.dialecticalTriad?.counterClaim);
  const limits = stripMarkup(article.dialecticalTriad?.whatIsNotEvidence);
  const context = `${article.title} ${summary} ${claim} ${counterClaim} ${limits} ${fullContent}`;
  const domain = selectDomain(context);
  const thesis = clip(claim, 390);
  const opposingPosition = counterClaim
    ? clip(counterClaim, 260)
    : `Bu tezi sınamak için, aynı olguyu farklı biçimde açıklayan en güçlü rakip görüş ve karşı örnekler açıkça kurulmalıdır.`;
  const evidenceText = /kaynak|araştırma|deney|ölçüm|veri|istatistik|gözlem|çalışma|kanıt|örneklem|literatür|referans/i.test(fullContent);

  const lenses: EvaluationLens[] = [
    {
      role: domain.roles[0],
      focus: domain.focus[0],
      assessment: `Makalenin temel savı şudur: “${thesis}” Mesleki uygulama açısından asıl soru, bu savın ${domain.practical}. Tez, sınırları ve hedef kitlesi belirginleştirildiğinde bir karar çerçevesine dönüştürülebilir; ancak sonuçların hangi koşullarda geçerli olduğu ayrıca gösterilmelidir.`,
      checks: [
        `Başlangıç durumu ve karşılaştırılacak mevcut yöntem açıkça tanımlanmalı.`,
        `Başarı ölçütü önceden belirlenmeli: ${domain.metric}.`,
        `Farklı koşullar ve başarısızlık senaryoları da değerlendirmeye alınmalı.`,
      ],
      nextStep: `Önerilen yaklaşımı küçük ve kontrollü bir pilotta mevcut yöntemle karşılaştırın; yalnızca olumlu örnekleri değil, başarısız sonuçları da kaydedin.`,
    },
    {
      role: domain.roles[1],
      focus: domain.focus[1],
      assessment: `Kanıt ve yöntem açısından belirleyici nokta, ${domain.evidence}. ${evidenceText ? 'Metinde araştırma, kaynak, ölçüm veya kanıt ifadelerinin yer alması yararlıdır; ancak bunların kalitesi ve tezi ne ölçüde desteklediği ayrıca denetlenmelidir.' : 'Bu değerlendirme görünümünde doğrulanabilir veri ve yöntem bilgisi ayrıca görünür kılınmalıdır; bunun bulunmaması, tek başına tezin yanlış olduğu anlamına gelmez.'} Mesleki inceleme, savın makul görünmesiyle onu destekleyen bağımsız kanıtı birbirinden ayırmalıdır.`,
      checks: [
        `Kullanılan kavramlar ve temel varsayımlar ölçülebilir ya da tartışılabilir biçimde tanımlanmalı.`,
        `Varsa kaynak, veri seti, örneklem, ölçüm yöntemi ve belirsizlikler izlenebilir olmalı.`,
        `Alternatif açıklama şu şekilde sınanmalı: ${opposingPosition}`,
      ],
      nextStep: `Tez–kanıt eşlemesi hazırlayın: her ana iddia için dayanak, karşı kanıt, belirsizlik ve doğrulama yöntemi ayrı ayrı yazılsın.`,
    },
    {
      role: domain.roles[2],
      focus: domain.focus[2],
      assessment: `Uygulamaya geçişte yalnızca beklenen fayda değil, ${domain.safeguards} da değerlendirilmelidir. Bu makaledeki tez karar vericiler için bir yön gösterici olabilir; ancak tek başına kurumsal politika veya geniş ölçekli uygulama kararı yerine geçmez. ${domain.limitation}`,
      checks: [
        `Etkilenen paydaşlar, olası zararlar ve sorumluluk sınırları belirlenmeli.`,
        `Uygulama sonuçları izlenebilir olmalı; itiraz, düzeltme ve geri alma yolu bulunmalı.`,
        limits ? `Makalede ayrıca belirtilen metodolojik uyarı da hesaba katılmalı: ${clip(limits, 190)}` : `Tezin geçerli olmadığı koşullar ve onu zayıflatabilecek karşı örnekler açıkça yazılmalı.`,
      ],
      nextStep: `Uygulama öncesi bir risk kaydı ve gözden geçirme ölçütleri oluşturun; yeni kanıt ortaya çıktığında değerlendirme güncellenebilsin.`,
    },
  ];

  return {
    domainName: domain.name,
    thesis,
    overall: `Bu makale için mesleki ön değerlendirme, “${clip(thesis, 210)}” tezini uygulama değeri, kanıt standardı ve olası yan etkiler açısından ele alır. Güçlü bir profesyonel değerlendirme, tezi hemen kabul etmek veya reddetmek yerine kapsamını belirler, karşı savı sınar ve doğrulama ölçütlerini açıklar.`,
    lenses,
  };
}

export const ProfessionalEvaluation: React.FC<ProfessionalEvaluationProps> = ({ article, compact = false }) => {
  const [expanded, setExpanded] = useState(!compact);
  const evaluation = useMemo(() => buildEvaluation(article), [article]);

  return (
    <section className={`w-full rounded-2xl border border-indigo-200/80 dark:border-indigo-900/70 bg-indigo-50/60 dark:bg-indigo-950/20 ${compact ? 'p-3.5 mt-4' : 'p-5 sm:p-6'}`} aria-label={`Mesleki değerlendirme: ${article.title}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-xl bg-indigo-600 text-white p-2">
          <BriefcaseBusiness className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-neutral-900 dark:text-neutral-100`}>
              Mesleki Bakış Açısıyla Tez Değerlendirmesi
            </h3>
            <span className="rounded-full border border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-neutral-900/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-800 dark:text-indigo-300">
              {evaluation.lenses.length} uzmanlık merceği
            </span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-600 dark:text-neutral-400">
            Alan: {evaluation.domainName} · Makale içeriği ve tez özeti temel alınır
          </p>
        </div>
      </div>

      <p className={`${compact ? 'mt-3 text-xs' : 'mt-4 text-sm'} leading-relaxed text-neutral-700 dark:text-neutral-300`}>
        {evaluation.overall}
      </p>

      <div className="mt-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white/80 dark:bg-neutral-900/60 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-800 dark:text-indigo-300">
          <ClipboardCheck className="w-3.5 h-3.5" /> İncelenen temel tez
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">{evaluation.thesis}</p>
      </div>

      {compact && !expanded && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {evaluation.lenses.map((lens) => (
            <span key={lens.role} className="rounded-lg border border-indigo-100 dark:border-indigo-900/60 bg-white/70 dark:bg-neutral-900/50 px-2 py-1 text-[10px] text-neutral-700 dark:text-neutral-300">
              {lens.role}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="mt-4 space-y-3">
          {evaluation.lenses.map((lens, index) => (
            <article key={lens.role} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-4">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1.5 text-indigo-700 dark:text-indigo-300">
                  {index === 1 ? <FlaskConical className="w-4 h-4" /> : index === 2 ? <ShieldAlert className="w-4 h-4" /> : <BriefcaseBusiness className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{lens.role}</h4>
                  <p className="mt-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">Odak: {lens.focus}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">{lens.assessment}</p>
              <div className="mt-3">
                <h5 className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Mesleki kontrol noktaları
                </h5>
                <ul className="mt-1.5 space-y-1.5 pl-4 list-disc text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {lens.checks.map((check) => <li key={check}>{check}</li>)}
                </ul>
              </div>
              <div className="mt-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 p-3">
                <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Önerilen sonraki adım</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">{lens.nextStep}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-3 border-t border-indigo-200/70 dark:border-indigo-900/70 pt-3">
        <p className="text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Şeffaflık notu: Bunlar belirli kişilere ait alıntılar veya gerçek uzman onayları değildir; makalenin tezine göre oluşturulmuş, mesleki değerlendirme ölçütlerini kullanan analitik bakış açılarıdır. Karar vermeden önce ilgili kaynaklar ve uzman görüşleri bağımsız olarak doğrulanmalıdır.
        </p>
        {compact && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((current) => !current);
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-2 text-xs font-bold text-white transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? <>Ayrıntıları gizle <ArrowUp className="w-3.5 h-3.5" /></> : <>Detaylı değerlendirmeyi aç <ArrowDown className="w-3.5 h-3.5" /> </>}
          </button>
        )}
      </div>
    </section>
  );
};
