import React, { useMemo, useState } from 'react';
import type { Article } from '../types/article';
import { ArrowDown, ArrowUp, BriefcaseBusiness, CheckCircle2, ClipboardList, FlaskConical, ShieldAlert } from 'lucide-react';

interface SectorEvaluationProps {
  article: Article;
  compact?: boolean;
}

interface SectorProfile {
  name: string;
  definition: string;
  relevance: string;
  opportunity: string;
  limits: string;
  checks: string[];
  metric: string;
}

const SECTORS: Record<string, SectorProfile> = {
  ai: {
    name: 'Yapay zekâ ve dijital teknoloji',
    definition: 'Makine öğrenmesi, büyük dil modelleri, algoritmalar, yazılım ürünleri, otomasyon ve bunların güvenli biçimde tasarlanıp kullanılmasını kapsar.',
    relevance: 'Tez; model davranışının, yazılım mimarisinin, kullanıcı deneyiminin veya otomatik kararların nasıl yorumlandığıyla ilişkili görünüyor.',
    opportunity: 'Uygun şekilde sınanırsa ürün tasarımı, model değerlendirmesi, insan-makine etkileşimi ve güvenlik gereksinimlerini netleştirmeye katkı sağlayabilir.',
    limits: 'Bir sistemin akıcı çıktı üretmesi, tek başına bilinçli olduğunu, her durumda doğru çalıştığını veya güvenli olduğunu göstermez. Teknik açıklama ile kanıtlanmış sonuç ayrı tutulmalıdır.',
    checks: ['İddiayı sınanabilir alt iddialara ayırın.', 'Temsilî görevlerde karşılaştırma, hata ve belirsizlik ölçün.', 'Mahremiyet, önyargı, güvenlik ve insan denetimini inceleyin.'],
    metric: 'doğruluk, tutarlılık, gecikme, maliyet ve hata sonrası toparlanma',
  },
  physics: {
    name: 'Fizik, matematik ve temel bilimler',
    definition: 'Doğal olayların matematiksel modeller, gözlem, ölçüm ve tekrarlanabilir deneylerle açıklanmasını araştıran alanları kapsar.',
    relevance: 'Tez; fiziksel bir yorum, matematiksel model veya doğa olaylarına ilişkin çıkarımlarla ilgili görünüyor.',
    opportunity: 'Varsayımlar ve öngörüler açıkça tanımlanırsa tezin mevcut modellerden farkı, açıklama gücü ve sınanma biçimi belirginleşebilir.',
    limits: 'Felsefi yorum veya matematiksel tutarlılık, tek başına fiziksel gerçekliği kanıtlamaz. Ölçüm, mevcut bilimsel bulgular ve alternatif açıklamalarla karşılaştırma gerekir.',
    checks: ['Modelin varsayımlarını ve geçerlilik aralığını yazın.', 'Öngörüleri ölçüm belirsizliği ve mevcut verilerle karşılaştırın.', 'Bağımsız tekrar ve alternatif açıklama olanağını değerlendirin.'],
    metric: 'önceden tanımlanmış öngörülerin bağımsız verilerde tekrarlanabilirliği',
  },
  health: {
    name: 'Sağlık ve yaşam bilimleri',
    definition: 'İnsan ve diğer canlıların biyolojisini, sağlığını, hastalıkları, klinik uygulamaları ve canlı sistemlerle ilgili araştırmaları kapsar.',
    relevance: 'Tez; biyolojik süreç, beyin, davranış, sağlık sonucu veya klinik uygulama iddiasıyla ilişkili olabilir.',
    opportunity: 'Kavramlar ve sonuç ölçütleri netleştirilirse araştırma sorusu daha belirgin hâle gelebilir ve kanıt boşlukları görülebilir.',
    limits: 'Genel bir yorum kişiye özgü tanı veya tedavi önerisine dönüştürülmemelidir. Klinik iddialar uygun bilimsel kanıt, etik inceleme ve yetkin değerlendirme gerektirir.',
    checks: ['Korelasyon ile nedenselliği ayırın.', 'Çalışma tasarımı, örneklem, etki büyüklüğü ve belirsizliği kontrol edin.', 'Zarar-fayda dengesini, mahremiyeti ve farklı gruplardaki etkileri inceleyin.'],
    metric: 'önceden belirlenmiş sağlık sonuçları, zarar-fayda dengesi ve bağımsız doğrulama',
  },
  economy: {
    name: 'Ekonomi, işletme ve çalışma hayatı',
    definition: 'Üretim, tüketim, piyasalar, finans, teşvikler, kuruluşlar, emek ve kaynakların dağılımıyla ilgili süreçleri kapsar.',
    relevance: 'Tez; karar alma, maliyet, ekonomik teşvik, iş modeli veya kaynak dağılımıyla ilişkili görünüyor.',
    opportunity: 'Varsayımlar ve uygulama koşulları açıklanırsa tezin hangi kararları etkileyebileceği ve olası maliyet-fayda dengesi tartışılabilir.',
    limits: 'Tek bir kuruluş veya örnekten bütün piyasalara genelleme yapılamaz. Dağılım etkileri, fırsat maliyeti ve uzun vadeli sonuçlar ayrıca değerlendirilmelidir.',
    checks: ['Başlangıç senaryosu ve karşılaştırma grubunu tanımlayın.', 'Maliyetleri, teşvikleri ve kazanç-kayıpların kimlere dağıldığını hesaplayın.', 'Farklı varsayımlar altında duyarlılık analizi yapın.'],
    metric: 'toplam maliyet, net fayda, dağılım etkisi ve uzun dönem performansı',
  },
  education: {
    name: 'Eğitim ve öğrenme bilimleri',
    definition: 'Öğretim tasarımı, öğrenme süreçleri, eğitim kurumları, ölçme-değerlendirme ve öğrenme ortamlarını kapsar.',
    relevance: 'Tez; öğrenme, öğretim, eğitim teknolojileri veya öğrenenlerin gelişimiyle ilgili görünüyor.',
    opportunity: 'Tez, öğrenme hedefleri ve uygulama koşullarıyla eşleştirilirse eğitim yaklaşımının nerede değer üretebileceği belirlenebilir.',
    limits: 'Kısa süreli başarı veya kullanıcı memnuniyeti, tek başına kalıcı öğrenmenin kanıtı değildir. Öğrenciler arasındaki farklılıklar gözetilmelidir.',
    checks: ['Öğrenme hedefini uygulamadan önce tanımlayın.', 'Ön test-son test ve mümkünse gecikmeli ölçüm kullanın.', 'Erişilebilirlik, adalet ve öğrenci verilerinin korunmasını değerlendirin.'],
    metric: 'kalıcı öğrenme, bilgiyi yeni duruma aktarma ve farklı gruplardaki sonuçlar',
  },
  environment: {
    name: 'Çevre, enerji ve sürdürülebilirlik',
    definition: 'Enerji sistemleri, iklim, ekoloji, doğal kaynaklar, kirlilik ve sürdürülebilirlik üzerindeki etkileri kapsar.',
    relevance: 'Tez; doğal sistemler, enerji kullanımı, çevresel etki veya sürdürülebilir uygulamalarla ilişkili görünüyor.',
    opportunity: 'Sistem sınırları ve ölçüm yöntemi tanımlanırsa doğrudan fayda ile dolaylı maliyetlerin birlikte değerlendirilmesine yardımcı olabilir.',
    limits: 'Tek bir gösterge veya kısa dönemli kazanım toplam çevresel etkiyi temsil etmeyebilir. Etkilerin zaman ve coğrafyaya göre değişmesi hesaba katılmalıdır.',
    checks: ['Başlangıç senaryosu ve sistem sınırlarını belirtin.', 'Yaşam döngüsü boyunca doğrudan ve dolaylı etkileri inceleyin.', 'Kaynak kullanımı, geri tepme etkisi ve yerel sonuçları değerlendirin.'],
    metric: 'yaşam döngüsü boyunca net etki, belirsizlik aralığı ve maliyet',
  },
  society: {
    name: 'Toplum, siyaset, hukuk ve kurumlar',
    definition: 'Toplumsal ilişkiler, kamu politikası, siyasal sistemler, hukuk, haklar ve kurumsal karar süreçlerini kapsar.',
    relevance: 'Tez; kurumların işleyişi, toplumsal davranış, haklar, kamu politikası veya güç ilişkileriyle ilgili görünüyor.',
    opportunity: 'Tez farklı gruplar ve kurumsal koşullar açısından açıklandığında bir politika ya da toplumsal yorumun hangi koşullarda geçerli olabileceği daha iyi tartışılabilir.',
    limits: 'Normatif bir görüş veya tekil vaka, tek başına genel toplumsal sonuç kanıtı değildir. Temsil gücü, tarihsel bağlam ve haklar dikkate alınmalıdır.',
    checks: ['Hangi grupların ve kurumların kapsandığını belirtin.', 'Karşılaştırmalı vakaları ve alternatif nedenleri inceleyin.', 'Haklar, ayrımcı etkiler ve hesap verebilirliği değerlendirin.'],
    metric: 'gruplar bazında sonuçlar, uygulama maliyeti, şeffaflık ve bağımsız gözetim',
  },
  philosophy: {
    name: 'Felsefe, etik ve kavramsal analiz',
    definition: 'Bilgi, gerçeklik, zihin, ahlak, mantık, varlık ve bilimin varsayımları üzerine kavramsal ve argümantatif incelemeleri kapsar.',
    relevance: 'Tez; temel kavramların anlamı, bir çıkarımın geçerliliği veya bilimsel bulguların felsefi yorumuyla ilişkili görünüyor.',
    opportunity: 'Kavramlar, öncüller ve sonuç arasındaki bağ açıklandığında tartışmanın tam olarak hangi noktada ayrıştığı ve nasıl sınanabileceği netleşebilir.',
    limits: 'Tutarlı bir argüman veya sezgisel açıdan güçlü düşünce deneyi, ampirik öncüllerin doğru olduğunu tek başına göstermez.',
    checks: ['Ana kavramları ve gizli varsayımları tanımlayın.', 'En güçlü karşı savları ve karşı örnekleri ele alın.', 'Mantıksal sonuçlarla deneysel iddiaları birbirinden ayırın.'],
    metric: 'öncüllerin açıklığı, çıkarım geçerliliği ve karşı örneklere dayanıklılık',
  },
  general: {
    name: 'Disiplinler arası bilim, teknoloji ve düşünce',
    definition: 'Tek bir uzmanlık alanına açıkça indirgenemeyen; birden fazla disiplinden kavram veya yöntem kullanan konuları kapsar.',
    relevance: 'Tez, tek bir sektöre ait olduğu kesinleşmeden önce birden fazla alanın kavramları ve varsayımlarıyla ilişkilendirilmelidir.',
    opportunity: 'İlgili disiplinler ve aralarındaki bağlantılar açıkça belirtilirse savın nerede uygulanabilir olduğu ve hangi bilgiye ihtiyaç duyduğu belirginleşebilir.',
    limits: 'Disiplinler arası benzetmeler yararlı bir başlangıç olabilir; ancak benzerlik, tek başına aynı mekanizmanın işlediğini göstermez.',
    checks: ['Her disiplinden alınan kavramların anlamını açıkça belirtin.', 'İddia, yorum ve doğrulanmış bulguları ayırın.', 'Sınır koşullarını ve alternatif açıklamaları yazın.'],
    metric: 'açık varsayımlar, önceden belirlenen ölçütler ve bağımsız olarak sınanabilir sonuçlar',
  },
};

function stripMarkup(value?: string): string {
  return String(value || '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, ' ').trim();
}

function clipped(value: string, max = 380): string {
  if (value.length <= max) return value;
  const point = value.lastIndexOf(' ', max - 1);
  return `${value.slice(0, point > max * 0.6 ? point : max).trim()}…`;
}

function findSector(article: Article): SectorProfile {
  const text = stripMarkup([
    article.title, article.summary, article.categories.join(' '), article.dialecticalTriad?.claim,
    article.dialecticalTriad?.counterClaim, article.content,
  ].join(' ')).toLocaleLowerCase('tr-TR');
  if (/yapay zek|\bllm\b|büyük dil model|makine öğren|algoritma|robot|dijital zihin|üretken yapay|generative ai|artificial intelligence|machine learning|chatbot|neural network/.test(text)) return SECTORS.ai;
  if (/kuantum|fizik|evren|kozmolo|entropi|görelilik|zaman oku|uzay-zaman|parçacık|yerçekim|kütleçekim|nötron yıldız|karanlık madde|physics|quantum|cosmolog|relativity|universum|quanten|física|physique/.test(text)) return SECTORS.physics;
  if (/sağlık|hastalık|klinik|tedavi|tıp|ilaç|biyoloji|nörobiy|beyin|nöron|genetik|psikiyatri|psikoloji|hasta|health|medical|clinic|biology|brain|neuron|gesundheit|santé|salud/.test(text)) return SECTORS.health;
  if (/ekonomi|ekonomik|finans|sermaye|piyasa|işletme|üretim maliyeti|emek piyasası|enflasyon|gelir dağılım|econom|business|finance|market|finanz|marché|mercado/.test(text)) return SECTORS.economy;
  if (/eğitim|öğrenme|öğretim|pedagoji|okul|üniversite|öğrenci|müfredat|öğretmen|education|learning|teaching|schule|éducation|educación/.test(text)) return SECTORS.education;
  if (/iklim|çevre|enerji|sürdürülebilir|karbon|ekoloji|yenilenebilir|biyoçeşitlilik|atık yönetim|climate|environment|energy|sustainab|umwelt|énergie|medio ambiente/.test(text)) return SECTORS.environment;
  if (/siyaset|politik|toplum|toplumsal|demokrasi|devlet|kurum|sosyoloji|eşitsizlik|haklar|hukuk|adalet|yönetişim|politic|society|societ|democracy|recht|droit|derecho/.test(text)) return SECTORS.society;
  if (/felsefe|etik|ahlak|ontoloji|epistemoloji|özgür irade|metafizik|varoluş|bilgi kuram|bilinç|şuur|gerçeklik|determinizm|öznel deneyim|philosoph|ethic|metaphysic|consciousness|conscience|bewusstsein|filosofía/.test(text)) return SECTORS.philosophy;
  return SECTORS.general;
}

function buildSectorEvaluation(article: Article) {
  const sector = findSector(article);
  const thesis = clipped(stripMarkup(article.dialecticalTriad?.claim) || stripMarkup(article.summary) || article.title, 420);
  const counter = clipped(stripMarkup(article.dialecticalTriad?.counterClaim), 260);
  const caveat = clipped(stripMarkup(article.dialecticalTriad?.whatIsNotEvidence), 230);
  const evidenceVisible = /kaynak|araştırma|deney|ölçüm|veri|istatistik|gözlem|çalışma|kanıt|örneklem|literatür|referans/i.test(stripMarkup(article.content));
  return {
    sector,
    thesis,
    relevance: sector.relevance,
    opportunity: sector.opportunity,
    limits: sector.limits,
    methodology: evidenceVisible
      ? 'Makale metninde araştırma veya kanıtla ilgili unsurlar bulunuyor. Bunların ana tezi ne ölçüde desteklediği, kaynak ve yöntem kalitesi ayrı incelenerek doğrulanmalıdır.'
      : 'Görünen makale metninde doğrulanabilir veri ve yöntem bilgisi sınırlı. Bu durum tek başına tezin yanlış olduğunu göstermez; değerlendirme için kaynak ve sınanabilir öngörüler gerekir.',
    counter: counter || 'Aynı olguyu açıklayan en güçlü alternatif görüş ve karşı örnekler belirlenip karşılaştırılmalıdır.',
    caveat,
    checks: sector.checks,
    metric: sector.metric,
  };
}

export const SectorEvaluation: React.FC<SectorEvaluationProps> = ({ article, compact = false }) => {
  const [expanded, setExpanded] = useState(!compact);
  const evaluation = useMemo(() => buildSectorEvaluation(article), [article]);
  return (
    <section className={`w-full rounded-2xl border border-sky-200/80 dark:border-sky-900/70 bg-sky-50/60 dark:bg-sky-950/20 ${compact ? 'p-3.5 mt-4' : 'p-5 sm:p-6'}`} aria-label={`Sektör değerlendirmesi: ${article.title}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-xl bg-sky-700 text-white p-2"><BriefcaseBusiness className="w-4 h-4" /></div>
        <div className="min-w-0 flex-1">
          <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-neutral-900 dark:text-neutral-100`}>Sektör Tanımı</h3>
          <p className="mt-1 text-xs font-semibold text-sky-800 dark:text-sky-300">{evaluation.sector.name}</p>
          <p className={`${compact ? 'mt-1.5 text-xs' : 'mt-2 text-sm'} leading-relaxed text-neutral-700 dark:text-neutral-300`}>{evaluation.sector.definition}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-sky-200/70 dark:border-sky-900/70 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-neutral-900 dark:text-neutral-100`}>Sektör Değerlendirmesi</h3>
          <span className="rounded-full border border-sky-200 dark:border-sky-800 bg-white/80 dark:bg-neutral-900/60 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:text-sky-300">İçerik temelli analiz</span>
        </div>
        <p className={`${compact ? 'mt-2 text-xs' : 'mt-3 text-sm'} leading-relaxed text-neutral-700 dark:text-neutral-300`}>{evaluation.relevance}</p>
        <div className="mt-3 rounded-xl border border-sky-100 dark:border-sky-900/60 bg-white/80 dark:bg-neutral-900/60 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-800 dark:text-sky-300"><ClipboardList className="w-3.5 h-3.5" /> Makalede savunulan tez</div>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">{evaluation.thesis}</p>
        </div>
        {expanded && (
          <div className="mt-3 space-y-3">
            <article className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100"><BriefcaseBusiness className="w-4 h-4 text-sky-700 dark:text-sky-300" /> Sektörel bağlantı ve olası katkı</div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">{evaluation.opportunity}</p>
            </article>
            <article className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100"><FlaskConical className="w-4 h-4 text-sky-700 dark:text-sky-300" /> Kanıt ve yöntem</div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">{evaluation.methodology}</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300"><strong>Karşı görüş / sınama:</strong> {evaluation.counter}</p>
              {evaluation.caveat && <p className="mt-2 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300"><strong>Metindeki metodolojik uyarı:</strong> {evaluation.caveat}</p>}
            </article>
            <article className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100"><ShieldAlert className="w-4 h-4 text-sky-700 dark:text-sky-300" /> Sınırlar, riskler ve kontrol ölçütleri</div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">{evaluation.limits}</p>
              <ul className="mt-2 space-y-1.5 pl-4 list-disc text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{evaluation.checks.map((check) => <li key={check}>{check}</li>)}</ul>
              <p className="mt-2 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300"><strong>İzlenebilecek ölçüt:</strong> {evaluation.metric}.</p>
            </article>
          </div>
        )}
        <p className="mt-3 border-t border-sky-200/70 dark:border-sky-900/70 pt-3 text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">Bu sektör değerlendirmesi makale metninden türetilmiş analitik bir çerçevedir; belirli bir uzmanın, sektör kuruluşunun veya gerçek kişinin görüşü değildir.</p>
        {compact && <button type="button" onClick={(event) => { event.stopPropagation(); setExpanded((current) => !current); }} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 px-3 py-2 text-xs font-bold text-white transition-colors" aria-expanded={expanded}>{expanded ? <>Ayrıntıları gizle <ArrowUp className="w-3.5 h-3.5" /></> : <>Sektör değerlendirmesini aç <ArrowDown className="w-3.5 h-3.5" /></>}</button>}
      </div>
    </section>
  );
};
