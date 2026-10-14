/**
 * Topic Clusters (Konu Kümeleri) & High-Authority SEO Pillars
 * Science & Philosophy — sci-phil.ai.studio
 */

export interface TopicCluster {
  id: string;
  name: string;
  nameEn: string;
  pillarSlug: string;
  pillarTitle: string;
  description: string;
  keywords: string[];
  subSlugs: string[];
  dialecticalFocus: string;
}

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: 'llm-consciousness',
    name: 'LLM Bilinç ve Şuur Ontolojisi',
    nameEn: 'LLM Consciousness & Machine Sentience',
    pillarSlug: 'llmlerin-insan-davranisini-taklit-etmesi-onlarin-suur-sahibi-olduklarini-gosteri-3117827894793638348',
    pillarTitle: 'LLM’lerin İnsan Davranışını Taklit Etmesi Onların Şuur Sahibi Olduklarını Gösterir mi?',
    description: 'Büyük Dil Modelleri (LLM), yapay zeka ontolojisi, Çin Odası deneyi, taklit yetisi ve fenomenal bilinç (qualia) arasındaki diyalektik ayrım.',
    keywords: [
      'LLM bilinç ve şuur',
      'yapay zeka bilinci var mı',
      'LLM insan taklidi ve akıl',
      'fenomenal bilinç qualia',
      'turing testi ve simülasyon',
      'makine şuuru ontolojisi'
    ],
    subSlugs: [
      'does-the-fact-that-llms-mimic-human-behavior-show-they-have-consciousness-4175545190349486799',
      'beweist-die-tatsache-dass-llms-menschliches-verhalten-nachahmen-dass-sie-ein-bew-4599366178067641283',
      'le-fait-que-les-llm-imitent-le-comportement-humain-prouve-t-il-quils-sont-dots-d-8383233014379744525',
      'el-hecho-de-que-los-llm-imiten-el-comportamiento-humano-demuestra-que-tienen-con-8998131455154199161'
    ],
    dialecticalFocus: 'Fonksiyonel davranış taklidi ile içsel öznel deneyim (qualia) arasındaki epistemolojik uçurum.'
  },
  {
    id: 'time-simulation',
    name: 'Zaman Simülasyonu ve Nöronal Algı',
    nameEn: 'Simulation Structure of Time & Neuronal Perception',
    pillarSlug: 'zamanin-simulasyon-yapisi-ve-noronal-zaman-algisi-3395198863934648239',
    pillarTitle: 'Zamanın Simülasyon Yapısı ve Nöronal Zaman Algısı',
    description: 'Fiziksel uzay-zaman ile biyolojik beynin zamansal inşası, blok evren teorisi ve bilincin gecikmeli algı mekanizmaları.',
    keywords: [
      'zamanın simülasyon yapısı',
      'nöronal zaman algısı',
      'blok evren teorisi',
      'şimdiki zaman illüzyonu',
      'termodinamik zaman oku',
      'beyin zamanı nasıl simüle eder'
    ],
    subSlugs: [
      'the-simulation-structure-of-time-and-neuronal-time-perception-9029718889265878465',
      'die-simulationsstruktur-der-zeit-und-die-neuronale-zeitwahrnehmung-1491965123809274702'
    ],
    dialecticalFocus: 'Zamanın dış dünyada akmadığı, beynin nedensellik matrisini kurmak için ürettiği bir simülasyon olduğu tezi.'
  },
  {
    id: 'free-will-determinism',
    name: 'Özgür İrade ve Belirlenimcilik (Determinizm)',
    nameEn: 'Free Will & Determinism',
    pillarSlug: 'ozgur-irade-ve-belirlenimcilik-determinizm-144799049449831966',
    pillarTitle: 'Özgür İrade ve Belirlenimcilik (Determinizm)',
    description: 'Nörobiyolojik determinizm, Libet deneyleri, kuantum belirsizlik ve özgür irade yanılsamasının felsefi analizi.',
    keywords: [
      'özgür irade yoktur felsefe',
      'determinizm ve özgür irade',
      'libet deneyi karar mekanizması',
      'nörobilim ve istemli eylem',
      'felsefi belirlenimcilik'
    ],
    subSlugs: [
      'yaratma-sanati-ve-yapilabilecekler-1885775824888267248',
      'the-art-of-creation-and-what-can-be-done-6451327201890959025'
    ],
    dialecticalFocus: 'Kararların bilinçli farkındalıktan yüzlerce milisaniye önce sinir ağlarında verilmesi ve illüzyonel irade hissi.'
  },
  {
    id: 'quantum-cosmology-kalam',
    name: 'Kuantum Dolanıklık, Kozmoloji ve Kelâm',
    nameEn: 'Quantum Cosmology, Entanglement & Kalam Metaphysics',
    pillarSlug: 'evren-her-zaman-tekil-bir-olguydu-ve-ilelebet-de-oyle-kalacak-8837081716175656566',
    pillarTitle: 'Evren Her Zaman Tekil Bir Olguydu ve İlelebet de Öyle Kalacak',
    description: 'Modern astrofizik, kuantum dolanıklık, tekil evren ontolojisi ve klasik kelâm geleneğindeki Hudûs ile Cevher-i Ferd nazariyesi.',
    keywords: [
      'kuantum dolanıklık ve kozmoloji',
      'kelâm ve modern fizik',
      'hudus teorisi ve büyük patlama',
      'cevher-i ferd kuantum parçacık',
      'evrenin tekilliği ontolojisi'
    ],
    subSlugs: [
      'kuark-yildizlari-ve-notron-yildizlari-1718330758410712217'
    ],
    dialecticalFocus: 'Parçaların bağımsız varlıklar olmayıp evrenin tekil dalga fonksiyonunun yerel görünümleri olması.'
  },
  {
    id: 'higgs-energy-matter',
    name: 'Higgs Bozonu, Madde ve Enerji Eşdeğerliği',
    nameEn: 'Higgs Field, Mass Generation & Energy-Matter Equivalence',
    pillarSlug: 'kuark-yildizlari-ve-notron-yildizlari-1718330758410712217',
    pillarTitle: 'Kuark Yıldızları ve Nötron Yıldızları',
    description: 'Higgs alanı, kütlenin enerji yoğunlaşması olarak tezahürü, dejenere madde fiziği ve temel kuvvetlerin birliği.',
    keywords: [
      'higgs parçacığı enerji formu',
      'kuark yıldızları dejenere madde',
      'nötron yıldızı yoğunluğu',
      'madde enerji eşdeğerliği e mc2',
      'vakum enerjisi ve kütle'
    ],
    subSlugs: [
      'evren-her-zaman-tekil-bir-olguydu-ve-ilelebet-de-oyle-kalacak-8837081716175656566'
    ],
    dialecticalFocus: 'Maddenin katı ve ayrık bir töz olmayıp enerjinin kararlı geometrik salınımlarından ibaret olduğu tezi.'
  }
];
