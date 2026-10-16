export interface MathFormula {
  name: string;
  latex: string;
  explanation: string;
  significance: string;
}

export interface ArticleMathFormulation {
  articleId: string;
  articleSlug: string;
  topicTitle: string;
  formulas: MathFormula[];
}

export const MATHEMATICAL_FORMULATIONS: Record<string, ArticleMathFormulation> = {
  // 1. Bir Enerji Formu Olarak HIGGS Parçacığı
  '8417669536166363827': {
    articleId: '8417669536166363827',
    articleSlug: 'bir-enerji-formu-olarak-higgs-parcacigi-8417669536166363827',
    topicTitle: 'Higgs Alanı, Kütle Üretimi ve Enerji Eşdeğerliği',
    formulas: [
      {
        name: 'Kütle-Enerji Eşdeğerliği (Einstein)',
        latex: 'E = m c^2 \\iff m = \\frac{E}{c^2}',
        explanation: 'Kütlenin ayrık bir katı töz değil, saf enerjinin yoğunlaşmış ve kararlı bir geometrik formu olduğunu kanıtlayan temel denklem.',
        significance: 'Higgs mekanizmasıyla durgun kütle kazanan parçacıkların enerjisel kökenini açıklar.'
      },
      {
        name: 'Higgs Potansiyeli ve Kendiliğinden Simetri Kırılması',
        latex: 'V(\\Phi) = -\\mu^2 \\Phi^\\dagger \\Phi + \\lambda (\\Phi^\\dagger \\Phi)^2',
        explanation: 'Meksika şapkası potansiyeli: evren soğurken vakum beklenti değerinin sıfırdan farklı bir minimuma oturmasıyla kütle oluşur.',
        significance: 'Elektrozayıf simetrinin kırılarak W/Z bozonları ve fermiyonların kütle kazanmasını matematiksel olarak açıklar.'
      },
      {
        name: 'Vakum Beklenti Değeri (VEV)',
        latex: 'v = \\sqrt{\\frac{\\mu^2}{\\lambda}} \\approx 246.22 \\text{ GeV}',
        explanation: 'Higgs alanının boş uzaydaki skaler vakum yoğunluğu ve temel kütle ölçeği.',
        significance: 'Evrendeki tüm temel parçacık kütlelerinin skaler referans tabanını oluşturur.'
      },
      {
        name: 'Yukawa Çiftlenimi ile Fermiyon Kütlesi',
        latex: '\\mathcal{L}_{\\text{Yukawa}} = -y_f \\bar{\\psi}_L \\Phi \\psi_R + \\text{h.c.} \\implies m_f = \\frac{y_f v}{\\sqrt{2}}',
        explanation: 'Elektron, kuark gibi fermiyonların Higgs alanı ile etkileşerek kazandıkları eylemsizlik kütlesi.',
        significance: 'Maddenin dokunulabilir ağırlığının ardındaki kuantum alan etkileşimini doğrudan formüle eder.'
      }
    ]
  },

  // 2. Evren Her Zaman Tekil Bir Olguydu ve İlelebet de Öyle Kalacak
  '8837081716175656566': {
    articleId: '8837081716175656566',
    articleSlug: 'evren-her-zaman-tekil-bir-olguydu-ve-ilelebet-de-oyle-kalacak-8837081716175656566',
    topicTitle: 'Kozmolojik Tekillik, Wheeler-DeWitt ve Planck Yoğunluğu',
    formulas: [
      {
        name: 'Wheeler-DeWitt Kuantum Kozmoloji Dalga Denklemi',
        latex: '\\hat{\\mathcal{H}} \\Psi[g_{ij}, \\phi] = 0',
        explanation: 'Tüm evrenin tekil kuantum dalga fonksiyonu. Zaman parametresi denklemde yer almaz; evren ezeli ve ebedi tek bir olgudur.',
        significance: 'Büyük Patlama öncesi ve sonrasının zamansız tek bir ontolojik durum olduğunu matematiksel olarak temellendirir.'
      },
      {
        name: 'Planck Yoğunluğu Tekillik Sınırı',
        latex: '\\rho_{\\text{Planck}} = \\frac{c^5}{\\hbar G^2} \\approx 5.15 \\times 10^{96} \\text{ kg/m}^3',
        explanation: 'Uzay-zamanın kuantum granülariteye ulaştığı maksimum sınır yoğunluk; mutlak sıfırdan yaratılış yerine faz geçişini gösterir.',
        significance: 'Kozmolojik çevrimlerde evrenin sıfıra çökmediğini, Planck eşiğinde sıçrama (Big Bounce) yaptığını ifade eder.'
      },
      {
        name: 'FLRW Kozmolojik Yayılma ve Friedmann Denklemi',
        latex: '\\left(\\frac{\\dot{a}}{a}\\right)^2 = \\frac{8\\pi G}{3}\\rho - \\frac{k c^2}{a^2} + \\frac{\\Lambda c^2}{3}',
        explanation: 'Evrenin ölçek faktörü a(t) ile enerji yoğunluğu rho arasındaki dinamik evrim bağıntısı.',
        significance: 'Döngüsel evren modelinde genişleme ve daralma fazlarının enerji korunumunu açıklar.'
      }
    ]
  },

  // 3. Zamanın Simülasyon Yapısı ve Nöronal Zaman Algısı
  '3395198863934648239': {
    articleId: '3395198863934648239',
    articleSlug: 'zamanin-simulasyon-yapisi-ve-noronal-zaman-algisi-3395198863934648239',
    topicTitle: 'Minkowski Uzay-Zaman Metriği ve Termodinamik Zaman Oku',
    formulas: [
      {
        name: 'Minkowski Değişmez Uzay-Zaman Aralığı',
        latex: 'ds^2 = -c^2 dt^2 + dx^2 + dy^2 + dz^2',
        explanation: 'Özel görelilikte zaman bir akış değil, uzayla birlikte 4-boyutlu manifoldun değişmez geometrik koordinatıdır (Blok Evren).',
        significance: 'Zamanın dış dünyada akmadığını, beynin bir illüzyon olarak simüle ettiğini gösterir.'
      },
      {
        name: 'Termodinamik Zaman Oku ve Entropi',
        latex: '\\Delta S_{\\text{evren}} \\ge 0 \\quad \\left(S = k_B \\ln \\Omega\\right)',
        explanation: 'Makroskopik dünyada zamanın tek yönlü hissedilmesinin tek fiziksel dayanağı olan entropi artışı.',
        significance: 'Nöronal bilincin geçmişi hatırlayıp geleceği simüle etmesinin termodinamik temelini tanımlar.'
      },
      {
        name: 'Öz Zaman (Proper Time) ve Nöral Gecikme',
        latex: '\\tau = \\int \\sqrt{1 - \\frac{v^2(t)}{c^2}} \\, dt \\quad (\\Delta t_{\\text{nöral}} \\approx 80\\text{ ms})',
        explanation: 'Gözlemcinin öz zamanı ile duyusal girdilerin beyinde birleştirilip bilince aktarılması arasındaki ~80 milisaniyelik simülasyon gecikmesi.',
        significance: 'Yaşadığımız "şimdi" anının geçmişin nöral bir kurgusu olduğunu matematiksel olarak kanıtlar.'
      }
    ]
  },

  // 4. Kuantum Dolanıklılık ve Evrenin Dokusu
  '2194925532715436086': {
    articleId: '2194925532715436086',
    articleSlug: 'kuantum-dolaniklilik-ve-evrenin-dokusu-uzay-zaman-illuzyonu-2194925532715436086',
    topicTitle: 'EPR Dolanıklık Durumu ve Holografik Entropi (ER=EPR)',
    formulas: [
      {
        name: 'Maksimal Dolanık Bell Durumu',
        latex: '|\\Psi^+\\rangle = \\frac{1}{\\sqrt{2}} \\left(|0\\rangle_A \\otimes |1\\rangle_B + |1\\rangle_A \\otimes |0\\rangle_B\\right)',
        explanation: 'Mesafe ne olursa olsun iki parçacığın tek bir kuantum durum fonksiyonunu paylaşması (yerel olmayan nedensellik).',
        significance: 'Klasik uzay-zaman ayrıklığının alttaki kuantum dolanıklığın bir türevi olduğunu ortaya koyar.'
      },
      {
        name: 'Ryu-Takayanagi Holografik Dolanıklık Entropisi',
        latex: 'S_A = \\frac{\\text{Alan}(\\gamma_A)}{4 G_N \\hbar}',
        explanation: 'Uzay-zaman geometrisinin kuantum dolanıklık ilmeklerinden örüldüğünü (ER=EPR) gösteren holografik bağıntı.',
        significance: 'Kütleçekim ve uzayın kendisinin kuantum enformasyonundan türediğini ispatlar.'
      }
    ]
  },

  // 5. Kuantum Süperpozisyonu ve Karar Alma İlişkisi
  '8215828762867440687': {
    articleId: '8215828762867440687',
    articleSlug: 'kuantum-superpozisyonu-ve-karar-alma-iliskisi-8215828762867440687',
    topicTitle: 'Durum Vektörü Süperpozisyonu ve Born Olasılık Kuralı',
    formulas: [
      {
        name: 'Kuantum Karar Süperpozisyon Durumu',
        latex: '|\\psi\\rangle = \\sum_{k=1}^n c_k |k\\rangle \\quad \\text{şartıyla} \\quad \\sum_{k=1}^n |c_k|^2 = 1',
        explanation: 'Karar anından önce zihinsel olasılıkların eş zamanlı kuantum süperpozisyonu.',
        significance: 'Klasik ikili seçim determinizminin ötesinde çoklu potansiyeller matrisini modeller.'
      },
      {
        name: 'Born Kuralı ile İndirgenme (Dalga Fonksiyonu Çöküşü)',
        latex: 'P(k) = |\\langle k | \\psi \\rangle|^2 = |c_k|^2',
        explanation: 'Gözlemcinin bilinçli seçimi veya dekoherans ile süperpozisyonun tek bir karara indirgenmesi.',
        significance: 'Ölçüm problemi ve bilincin seçim dinamiklerini fiziksel olasılıklarla açıklar.'
      }
    ]
  },

  // 6. Evren Yazılımında Karadeliklerin İşlevi
  '5450726092373986672': {
    articleId: '5450726092373986672',
    articleSlug: 'evren-yaziliminda-karadeliklerin-islevi-5450726092373986672',
    topicTitle: 'Schwarzschild Olay Ufku ve Bekenstein-Hawking Bilgi Entropisi',
    formulas: [
      {
        name: 'Schwarzschild Yarıçapı (Olay Ufku)',
        latex: 'r_s = \\frac{2 G M}{c^2}',
        explanation: 'Işığın ve bilginin kaçamayacağı kritik gravitasyonel sınır yarıçapı.',
        significance: 'Karadeliklerin evren yazılımında bilginin depolandığı holografik arayüzü tanımlar.'
      },
      {
        name: 'Bekenstein-Hawking Bilgi Sınırı (Holografik İlke)',
        latex: 'S_{BH} = \\frac{k_B c^3 A}{4 G \\hbar} = \\frac{k_B A}{4 \\ell_P^2}',
        explanation: 'Bir karadeliğin taşıyabileceği maksimum enformasyon hacimle değil, olay ufkunun yüzey alanıyla orantılıdır.',
        significance: '3-boyutlu evrenin 2-boyutlu bir holografik projeksiyon olduğu teorisinin temel dayanağıdır.'
      }
    ]
  }
};

export function getFormulationsForArticle(articleIdOrSlug: string): ArticleMathFormulation | null {
  if (!articleIdOrSlug) return null;
  const direct = MATHEMATICAL_FORMULATIONS[articleIdOrSlug];
  if (direct) return direct;
  const bySlug = Object.values(MATHEMATICAL_FORMULATIONS).find(
    (item) => item.articleSlug === articleIdOrSlug || articleIdOrSlug.includes(item.articleId)
  );
  return bySlug || null;
}
