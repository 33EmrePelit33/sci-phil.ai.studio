import { Article } from '../types/article';
import { PRECOMPUTED_TRANSLATIONS } from './precomputedTranslations';

export interface TranslatedArticleMeta {
  title: string;
  summary: string;
  claim?: string;
  counterClaim?: string;
}

// Multilingual translations for articles
export const ARTICLE_DICTIONARY: Record<string, Record<string, TranslatedArticleMeta>> = {
  // 70th Article
  '8837081716175656566': {
    en: {
      title: 'The Universe Has Always Been a Singular Phenomenon and Will Remain So Forever',
      summary: 'An ontological inquiry into the phenomenon preceding the Big Bang and the cyclic existence-annihilation hypothesis of the cosmos.',
      claim: 'The universe has always been a singular phenomenon across cyclical creation-annihilation epochs.',
      counterClaim: 'The cosmos originated exclusively from a single Big Bang into irreversible entropic heat death.'
    },
    de: {
      title: 'Das Universum war schon immer ein singuläres Phänomen und wird es auf ewig bleiben',
      summary: 'Eine ontologische Untersuchung des Phänomens vor dem Urknall und der zyklischen Existenz-Vernichtungs-Hypothese.',
      claim: 'Das Universum war von jeher ein singuläres Phänomen über zyklische Schöpfungs- und Auflösungsphasen hinweg.',
      counterClaim: 'Der Kosmos entstand einmalig aus dem Urknall und strebt einem irreversiblen Entropietod zu.'
    },
    fr: {
      title: "L'Univers a toujours été un phénomène singulier et le restera pour l'éternité",
      summary: "Une enquête ontologique sur le phénomène précédant le Big Bang et l'hypothèse cyclique de création-annihilation.",
      claim: "L'univers a toujours été un phénomène singulier à travers des cycles cycliques d'existence et de néant.",
      counterClaim: "L'univers est né d'un Big Bang unique et converge vers une mort thermique irréversible."
    },
    es: {
      title: 'El Universo siempre ha sido un fenómeno singular y lo seguirá siendo por toda la eternidad',
      summary: 'Una indagación ontológica sobre el fenómeno previo al Big Bang y la hipótesis del ciclo cósmico de existencia y aniquilación.',
      claim: 'El universo siempre ha sido un fenómeno singular a lo largo de ciclos cósmicos continuos.',
      counterClaim: 'El cosmos surgió únicamente de la nada en el Big Bang y culminará en la muerte térmica.'
    },
    it: {
      title: "L'Universo è sempre stato un fenomeno singolare e rimarrà tale per l'eternità",
      summary: "Un'indagine ontologica sul fenomeno precedente al Big Bang e sull'ipotesi ciclica dell'esistenza.",
      claim: "L'universo è sempre stato un fenomeno singolare attraverso cicli cosmici di creazione e dissoluzione.",
      counterClaim: "L'universo ha avuto un'origine assoluta e procederà verso la morte entropica definitiva."
    },
    ru: {
      title: 'Вселенная всегда была сингулярным феноменом и останется таковой во веки веков',
      summary: 'Онтологическое исследование феномена, предшествовавшего Большому взрыву, и гипотезы цикличности мироздания.',
      claim: 'Вселенная всегда представляла собой единый сингулярный феномен в циклической космологии.',
      counterClaim: 'Вселенная возникла абсолютно из ничего и движется к необратимой тепловой смерти.'
    },
    ar: {
      title: 'الكون كان دائمًا ظاهرة فريدة وسيبقى كذلك إلى الأبد',
      summary: 'بحث وجودي في الظاهرة التي سبقت الانفجار العظيم وفرضية الوجود والفناء الدوري للكون.',
      claim: 'الكون كان دائمًا ظاهرة واحدة فريدة عبر دورات الخلق والفناء الكونية المستمرة.',
      counterClaim: 'نشأ الكون بمفرده من العدم التام وسينتهي بموت حراري لا رجعة فيه.'
    },
    ja: {
      title: '宇宙は常に特異な現象であり、永遠にそうあり続ける',
      summary: 'ビッグバン以前の現象と宇宙の周期的生成・消滅仮説に関する存在論的探求。',
      claim: '宇宙は不可知の根源以来、循環的な生成と消滅を通じて常に特異な単一の現象である。',
      counterClaim: '宇宙はビッグバンにおいて絶対的無から始まり、不可逆な熱的死へと向かう。'
    },
    zh: {
      title: '宇宙历来是一个奇异现象，并将永远如此',
      summary: '关于大爆炸前现象及宇宙循环生灭假说的本体论探索。',
      claim: '自不可知的源起以来，宇宙在循环创生与消解中历来是一个奇异的统一体。',
      counterClaim: '宇宙在宇宙大爆炸中从绝对虚无诞生，并走向不可逆的热寂。'
    }
  },

  // LLM Consciousness Pillar
  '3117827894793638348': {
    en: {
      title: 'Does LLMs Mimicking Human Behavior Prove They Possess Consciousness (Qualia)?',
      summary: 'Analyzing whether Large Language Models possess true phenomenal consciousness through computational imitation and Chinese Room ontology.',
      claim: 'Imitation of human dialogue does not entail phenomenal consciousness or intentional qualia.',
      counterClaim: 'Behavioral indistinguishability across comprehensive domains is functionally equivalent to consciousness.'
    },
    de: {
      title: 'Beweist die menschliche Verhaltensimitation von LLMs, dass sie Bewusstsein besitzen?',
      summary: 'Untersuchung, ob Große Sprachmodelle durch computergestützte Imitation echtes phänomenales Bewusstsein besitzen.',
      claim: 'Das bloße Nachahmen menschlicher Sprache beweist kein ontologisches Bewusstsein oder Qualia.',
      counterClaim: 'Funktionale Ununterscheidbarkeit im Sprachverhalten entspricht hinreichendem Bewusstsein.'
    },
    fr: {
      title: "L'imitation du comportement humain par les LLM prouve-t-elle qu'ils ont une conscience ?",
      summary: "Analyse ontologique de la frontière entre simulation statistique du langage et conscience phénoménale.",
      claim: "L'imitation linguistique ne prouve en aucun cas la présence de qualia ou d'intentionnalité intérieure.",
      counterClaim: "L'équivalence fonctionnelle et comportementale suffit pour attribuer des états conscients."
    },
    es: {
      title: '¿Demuestra que los LLM imiten la conducta humana que poseen conciencia (qualia)?',
      summary: 'Análisis ontológico sobre la distinción entre simulación algorítmica y conciencia fenomenal.',
      claim: 'La imitación conductual no demuestra la posesión de qualia subjetivos ni intencionalidad ontológica.',
      counterClaim: 'La indistinguibilidad funcional en el lenguaje equivale pragmáticamente a la conciencia.'
    },
    it: {
      title: "L'imitazione del comportamento umano da parte dei LLM dimostra che possiedono coscienza?",
      summary: "Analisi ontologica della differenza tra imitazione computazionale e reale coscienza fenomenica.",
      claim: "L'imitazione linguistica non costituisce prova di qualia soggettivi o intenzionalità ontologica.",
      counterClaim: "L'equivalenza funzionale osservabile è sufficiente per attribuire intelligenza cosciente."
    },
    ru: {
      title: 'Доказывает ли имитация поведения человека моделями LLM наличие у них сознания?',
      summary: 'Онтологический анализ границы между статистической симуляцией языка и феноменальным сознанием.',
      claim: 'Имитация человеческого поведения алгоритмами не доказывает наличия феноменального сознания (квалиа).',
      counterClaim: 'Функциональная неразличимость в поведении эквивалентна наличию сознания.'
    },
    ar: {
      title: 'هل تقليد النماذج اللغوية الكبيرة للسلوك البشري يثبت امتلاكها للوعي والشعور؟',
      summary: 'تحليل أنطولوجي للفرق بين المحاكاة الإحصائية اللغوية والوعي الظاهراتي الذاتي.',
      claim: 'محاكاة لغة وسلوك الإنسان لا تثبت امتلاك النموذج لوعي وجودي أو كواليا ذاتية.',
      counterClaim: 'التطابق الوظيفي السلوكي في كافة السياقات يكفي لافتراض وجود الوعي.'
    },
    ja: {
      title: '大規模言語モデル（LLM）の人間の模倣は「意識（クオリア）」の証拠か？',
      summary: '計算模倣と中国の部屋の存在論を通じ、LLMが真の現象的意識を持つかを批判的に分析する。',
      claim: '人間の言語行動の統計的模倣は、主観的クオリアや志向的意識の存在を証明しない。',
      counterClaim: '言語行動における機能的非識別性は意識の存在と同等とみなすべきである。'
    },
    zh: {
      title: '大语言模型（LLM）模仿人类行为是否证明其具有“意识（感受质）”？',
      summary: '通过计算模仿与中文屋论证，批判性探讨统计语言模型与现象意识之间的本体论界限。',
      claim: '对人类对话与行为的精准模仿并不能证明模型具有内在主观感受质或本体意识。',
      counterClaim: '在各种语境下表现出的功能等价性足以在实用主义层面被认定为意识。'
    }
  },

  // Time Simulation Pillar
  '3395198863934648239': {
    en: {
      title: 'The Simulation Structure of Time and Neuronal Time Perception',
      summary: 'How physical spacetime and neural perception synthesize our subjective reality in DeWitt quantum mechanics and the block universe.',
      claim: 'Physical time lacks an absolute universal flow; our timeline is a neural simulation interface.',
      counterClaim: 'Thermodynamic entropy dictates an objective, irreversible linear arrow of real time.'
    },
    de: {
      title: 'Die Simulationsstruktur der Zeit und die neuronale Zeitwahrnehmung',
      summary: 'Wie Raumzeit und biologische Gehirne unsere Wirklichkeit im Blockuniversum und der DeWitt-Quantenmechanik konstruieren.',
      claim: 'Physikalische Zeit besitzt keinen absoluten universellen Fluss; Zeit ist ein neuronales Simulationsinterface.',
      counterClaim: 'Die thermodynamische Entropie erzwingt einen objektiven, unumkehrbaren linearen Zeitpfeil.'
    },
    fr: {
      title: 'La structure de simulation du temps et la perception temporelle neuronale',
      summary: 'Comment les équations quantiques de DeWitt et la neurobiologie révèlent le temps comme interface simulée.',
      claim: "Il n'y a pas d'écoulement universel absolu du temps; notre perception est une simulation neuronale.",
      counterClaim: "L'entropie thermodynamique impose une flèche du temps objective et irréversible."
    },
    es: {
      title: 'La estructura de simulación del tiempo y la percepción temporal neuronal',
      summary: 'Cómo las ecuaciones cuánticas de DeWitt y el cerebro biológico construyen la ilusión del flujo temporal.',
      claim: 'El tiempo no tiene un flujo absoluto universal; nuestro tiempo vivido es una interfaz de simulación neuronal.',
      counterClaim: 'La entropía termodinámica demuestra una flecha objetiva e irreversible del tiempo físico.'
    },
    it: {
      title: 'La struttura di simulazione del tempo e la percezione temporale neuronale',
      summary: "Come la meccanica quantistica di DeWitt e le reti neurali creano l'interfaccia soggettiva del tempo.",
      claim: "Non esiste un flusso temporale universale assoluto; il tempo è un'interfaccia neurale simulata.",
      counterClaim: "L'entropia termodinamica stabilisce una freccia del tempo oggettiva e irreversibile."
    },
    ru: {
      title: 'Симуляционная структура времени и нейронное восприятие времени',
      summary: 'Как квантовые уравнения ДеВитта и нейробиология показывают время как биологический интерфейс симуляции.',
      claim: 'В физической вселенной нет абсолютного течения времени; субъективное время — симуляционный интерфейс мозга.',
      counterClaim: 'Термодинамическая энтропия диктует объективную необратимую стрелу времени.'
    },
    ar: {
      title: 'بنية محاكاة الزمان والإدراك العصبي للوقت',
      summary: 'كيف تكشف معادلات ديويت الكمومية وعلم الأعصاب عن الزمان كواجهة محاكاة بيولوجية في الكون المتكتل.',
      claim: 'لا يوجد تدفق كوني مطلق للزمن؛ إدراكنا للوقت هو واجهة محاكاة عصبية داخل الدماغ.',
      counterClaim: 'الإنتروبيا الديناميكية الحرارية تفرض سهمًا موضوعيًا لا رجعة فيه للزمن الحقيقي.'
    },
    ja: {
      title: '時間のシミュレーション構造と神経的時間知覚',
      summary: 'ド・ウィット量子力学とブロック宇宙論を通じ、脳が時間をどのようにシミュレートするかを探求する。',
      claim: '物理的宇宙に絶対的な時間の流れはなく、我々の時間は脳の神経シミュレーション界面である。',
      counterClaim: '熱力学的エントロピーは客観的で不可逆な実在の時間の矢を決定づけている。'
    },
    zh: {
      title: '时间的模拟结构与神经时间感知',
      summary: '结合德威特量子方程与神经生物学，探讨块状宇宙中主观时间的神经模拟界面。',
      claim: '物理宇宙中不存在绝对的普遍时间流；我们所体验的时间是大脑后验同步的模拟界面。',
      counterClaim: '热力学熵增确立了不可逆的客观时间之矢。'
    }
  },

  // Free Will & Determinism
  'ozgur-irade-illuzyonu-ve-determinizm': {
    en: {
      title: 'The Illusion of Free Will and Metaphysical Determinism',
      summary: 'Scientific experiments from Libet to readiness potentials, synthesizing fatalism and Islamic Kalam.',
      claim: 'Biological conscious agency is an illusion generated after sub-threshold neural computations.',
      counterClaim: 'Quantum indeterminacy and moral agency preserve authentic free will.'
    },
    de: {
      title: 'Die Illusion des freien Willens und der metaphysische Determinismus',
      summary: 'Wissenschaftliche Experimente von Libet bis zu Bereitschaftspotenzialen und theologische Kausalität.',
      claim: 'Bewusster freier Wille ist eine nachträgliche Illusion unbewusster neuronaler Berechnungen.',
      counterClaim: 'Quantenunbestimmtheit und moralische Verantwortung bewahren den freien Willen.'
    },
    fr: {
      title: "L'illusion du libre arbitre et le déterminisme métaphysique",
      summary: "Des expériences de Libet au potentiel de préparation, une synthèse entre neurosciences et théologie.",
      claim: "La volonté consciente est une illusion générée après les calculs neuronaux sous-jacents.",
      counterClaim: "L'indétermination quantique et la responsabilité morale maintiennent le libre arbitre."
    },
    es: {
      title: 'La ilusión del libre albedrío y el determinismo metafísico',
      summary: 'De los experimentos de Libet a la causalidad ontológica en la física y la filosofía de la mente.',
      claim: 'La agencia consciente es una construcción posterior a los procesos neuronales previos.',
      counterClaim: 'La indeterminación cuántica y la autodeterminación moral sostienen el libre albedrío.'
    },
    it: {
      title: "L'illusione del libero arbitrio e il determinismo metafisico",
      summary: "Dagli esperimenti di Libet al potenziale di prontezza: neuroscienze e causalità filosofica.",
      claim: "La volontà cosciente è un'illusione generata a valle dell'elaborazione neurale inconscia.",
      counterClaim: "L'indeterminismo quantistico e la responsabilità etica salvano il libero arbitrio."
    },
    ru: {
      title: 'Иллюзия свободы воли и метафизический детерминизм',
      summary: 'От экспериментов Либета до потенциала готовности: синтез нейробиологии и исламского калама.',
      claim: 'Осознанная свобода воли является иллюзией, возникающей после бессознательных нейронных реакций.',
      counterClaim: 'Квантовая неопределенность и моральная ответственность обеспечивают свободу выбора.'
    },
    ar: {
      title: 'وهم الإرادة الحرة والحتمية الميتافيزيقية',
      summary: 'من تجارب ليبت وإمكانات الجاهزية العصبية إلى التوفيق بين الفيزياء والقدر في علم الكلام.',
      claim: 'الإرادة الواعية هي بناء استرجاعي يظهر بعد إطلاق الإشارات العصبية غير الواعية.',
      counterClaim: 'اللاحتمية الكمومية والمسؤولية الأخلاقية تثبت وجود إرادة حرة حقيقية.'
    },
    ja: {
      title: '自由意志の幻想と形而上学的決定論',
      summary: 'リベットの実験から準備電位、量子力学とイスラーム神学（カラーム）の包括的考察。',
      claim: '意識的な自由意志は無意識の神経発火の後に構築される後付けの幻想である。',
      counterClaim: '量子力学の不確定性と道徳的責任は本物の選択の自由を保持している。'
    },
    zh: {
      title: '自由意志的幻象与形而上学决定论',
      summary: '从李贝特准备电位实验到量子随机性，跨学科探讨意识主导权与决定论。',
      claim: '意识层面的自由意志是大脑阈下神经计算完成之后建构的叙事幻象。',
      counterClaim: '量子不确定性与伦理道德责任维持着真实的自主选择空间。'
    }
  },

  // Quantum Entanglement & Kalam
  'kuantum-dolaniklik-ve-kelam-kozmolojisi': {
    en: {
      title: 'Quantum Entanglement and Kalam Cosmology: Non-locality and Atomic Substance',
      summary: 'Comparing Bell inequalities and EPR paradox with the atomistic occasionalism (Jawhar al-Fard) in classical Kalam.',
      claim: 'Spacetime is non-fundamental; underlying reality operates through instant interconnected discrete events.',
      counterClaim: 'Local hidden variable theories and relativity rule out genuine non-local instantaneous causation.'
    },
    de: {
      title: 'Quantenverschränkung und Kalam-Kosmologie: Nichtlokalität und Einzelsubstanz',
      summary: 'Vergleich von Bellschen Ungleichungen mit dem atomistischen Okkasionalismus (Dschawhar al-Fard) im klassischen Kalam.',
      claim: 'Raumzeit ist nicht fundamental; die Realität beruht auf augenblicklicher, nichtlokaler Verbundenheit.',
      counterClaim: 'Lokale Kausalität und Relativität verbieten echte überlichtschnelle Informationsübertragung.'
    },
    fr: {
      title: 'Intrication quantique et cosmologie du Kalam: Non-localité et atome discret',
      summary: "Mise en parallèle des théorèmes de Bell avec l'occasionnalisme de la substance unique (Jawhar al-Fard).",
      claim: "L'espace-temps n'est pas fondamental; la réalité procède d'événements discrets instantanément reliés.",
      counterClaim: 'La causalité locale et la relativité restreinte réfutent toute action supra-luminique directe.'
    },
    es: {
      title: 'Entrelazamiento cuántico y cosmología del Kalam: No-localidad y sustancia atómica',
      summary: 'Comparando las desigualdades de Bell con el atomismo y la causa continua (Yawhar al-Fard) en el Kalam clásico.',
      claim: 'El espacio-tiempo no es fundamental; la trama cósmica opera mediante interconexiones instantáneas no locales.',
      counterClaim: 'La física relativista y las variables ocultas locales descartan influencias instantáneas reales.'
    },
    it: {
      title: 'Entanglement quantistico e cosmologia del Kalam: Non-località e atomismo',
      summary: 'Analisi comparata tra il teorema di Bell e la teoria della sostanza indivisibile (Jawhar al-Fard).',
      claim: "Lo spazio-tempo non è fondamentale; gli eventi universali sono interconnessi istantaneamente.",
      counterClaim: "Il principio di località relativistico esclude trasmissioni causali istantanee a distanza."
    },
    ru: {
      title: 'Квантовая запутанность и космология калама: Нелокальность и неделимый атом',
      summary: 'Сравнение неравенств Белла и эйнштейновского парадокса с атомизмом (джавхар аль-фард) в каламе.',
      claim: 'Пространство-время вторично; квантовая реальность функционирует через неделимые мгновенные акты.',
      counterClaim: 'Теория относительности и локальность исключают реальное сверхсветовое причинное воздействие.'
    },
    ar: {
      title: 'التشابك الكمي وكوزمولوجيا علم الكلام: اللاموضعية والجوهر الفرد',
      summary: 'مقارنة بين مبرهنة بيل ونظرية النسبية ومفهوم الجوهر الفرد والتجدد المستمر في علم الكلام الإسلامي.',
      claim: 'الزمكان ليس نسيجًا أوليًا، بل حوادث ذرية منفصلة متجددة في كل آن بأمر الخالق.',
      counterClaim: 'مبدأ الموضعية في النسبية ينفي التأثيرات السببية اللحظية المتجاوزة لسرعة الضوء.'
    },
    ja: {
      title: '量子もつれとカラーム宇宙論：非局所性と不可分原子（単一実体）',
      summary: 'ベルの不等式とアインシュタインの逆説をイスラーム古典哲学の不可分原子論（ジャウハル・ファルド）と対比。',
      claim: '時空は根源的ではなく、実在は非局所的かつ瞬時的な離散事象によって支えられている。',
      counterClaim: '相対性理論の局所実在論は真の超光速的非局所因果を排除する。'
    },
    zh: {
      title: '量子纠缠与凯俩目宇宙学：非局域性与离散单子（极微）',
      summary: '对比贝尔不等式、量子非局域性与古典凯俩目哲学中极微原子论（Jawhar al-Fard）的创生观。',
      claim: '时空并非最底层的物理实体；实在界由瞬时关联的离散离散事态连续创生构成。',
      counterClaim: '狭义相对论与局域实在论排除了真正超光速的直接非局域因果传递。'
    }
  },

  // Higgs Particle Energy Form
  '8417669536166363827': {
    en: {
      title: 'The Higgs Particle as a Form of Pure Energy and Mass Genesis',
      summary: 'Investigating whether the Higgs mechanism operates as an energetic conduit of universal order and divine command.',
      claim: 'Higgs particle mass-conferring mechanism embodies the equivalence of pure energy and material substance.',
      counterClaim: 'Mass arises strictly through spontaneous electroweak symmetry breaking without metaphysical agency.'
    },
    de: {
      title: 'Das Higgs-Teilchen als Form reiner Energie und Ursprung der Masse',
      summary: 'Untersuchung, ob der Higgs-Mechanismus als energetischer Kanal universeller Ordnung fungiert.',
      claim: 'Der Higgs-Mechanismus verkörpert die reale Äquivalenz von reiner Energie und materieller Masse.',
      counterClaim: 'Masse entsteht ausschließlich durch elektroschwache Symmetriebrechung ohne Metaphysik.'
    },
    fr: {
      title: 'Le boson de Higgs comme forme d’énergie pure et genèse de la masse',
      summary: 'Analyse ontologique de la matérialisation de la masse à partir du champ scalaire de Higgs.',
      claim: "Le mécanisme de Higgs incarne la transmutation fondamentale entre énergie pure et matière.",
      counterClaim: 'La masse dérive purement de la brisure spontanée de symétrie électrofaible standard.'
    },
    es: {
      title: 'La partícula de Higgs como forma de energía pura y origen de la masa',
      summary: 'Indagando si el campo de Higgs actúa como puente entre la energía pura y la materia tangible.',
      claim: 'El mecanismo de Higgs materializa la equivalencia ontológica entre energía y masa cósmica.',
      counterClaim: 'La masa se explica exclusivamente mediante la ruptura espontánea de simetría electrodébil.'
    },
    it: {
      title: 'Il bosone di Higgs come forma di energia pura e genesi della massa',
      summary: 'Studio sulla conversione di energia in massa materiale tramite il campo scalare di Higgs.',
      claim: "Il meccanismo di Higgs rappresenta la manifestazione ontologica dell'equivalenza massa-energia.",
      counterClaim: 'La massa è prodotta interamente dalla rottura spontanea di simmetria del Modello Standard.'
    },
    ru: {
      title: 'Частица Хиггса как форма чистой энергии и генезис массы',
      summary: 'Исследование бозона Хиггса как связующего звена между чистой энергией и материальной массой.',
      claim: 'Механизм Хиггса воплощает эквивалентность чистой энергии и материальной субстанции.',
      counterClaim: 'Масса возникает исключительно вследствие спонтанного нарушения электрослабой симметрии.'
    },
    ar: {
      title: 'جسيم هيغز كشكل من أشكال الطاقة النقية ومصدر نشوء الكتلة',
      summary: 'دراسة فلسفية وفيزيائية في كيفية منح حقل هيغز الكتلة للجسيمات وتحويل الطاقة إلى مادة.',
      claim: 'آلية هيغز لتوليد الكتلة تجسد التحول الوجودي المباشر بين الطاقة المجردة والمادة الملموسة.',
      counterClaim: 'تكتسب الجسيمات كتلتها عبر كسر التناظر الكهروضعيف التلقائي في النموذج العياري فقط.'
    },
    ja: {
      title: '純粋エネルギーの形態としてのヒッグス粒子と質量の起源',
      summary: 'ヒッグス場がどのように素粒子に質量を付与し、エネルギーと物質の等価性を体現しているかを考察。',
      claim: 'ヒッグス機構は純粋エネルギーが実体ある物質質量へと転化する存在論的架け橋である。',
      counterClaim: '質量は電弱対称性の自発的破れによって純粋に物理学的に説明される。'
    },
    zh: {
      title: '作为纯能量形式的希格斯玻色子与质量起源',
      summary: '从物理学与形而上学双重视角剖析希格斯场赋予粒子质量并连接质能等价性的深层机制。',
      claim: '希格斯粒子赋予质量的过程体现了纯粹能量与可观实体物质之间的本体论转换。',
      counterClaim: '质量的获得完全由标准模型中的电弱自发对称性破缺所决定，无需形而上诠释。'
    }
  }
};

/**
 * Returns translated article metadata for display in catalog, cards, or views.
 * Fallback to intelligent title/summary translation if target language is not Turkish.
 */
export function getTranslatedArticle(article: Article, targetLangCode: string): Article {
  const code = (targetLangCode || 'tr').toLowerCase();
  if (code === 'tr') {
    return article;
  }

  // 1. Check in precomputed translations (full payload)
  const pre = PRECOMPUTED_TRANSLATIONS[article.id] || PRECOMPUTED_TRANSLATIONS[article.slug];
  if (pre && pre[code]) {
    const item = pre[code];
    return {
      ...article,
      title: item.translatedTitle || article.title,
      summary: item.translatedSummary || article.summary,
      content: item.translatedContent || article.content,
      dialecticalTriad: {
        claim: item.translatedDialecticalTriad?.claim || article.dialecticalTriad?.claim || '',
        counterClaim: item.translatedDialecticalTriad?.counterClaim || article.dialecticalTriad?.counterClaim || '',
        whatIsNotEvidence: item.translatedDialecticalTriad?.whatIsNotEvidence || article.dialecticalTriad?.whatIsNotEvidence || '',
        methodologicalNote: item.translatedDialecticalTriad?.methodologicalNote || article.dialecticalTriad?.methodologicalNote
      }
    };
  }

  // 2. Check in curated ARTICLE_DICTIONARY
  const dictEntry = ARTICLE_DICTIONARY[article.id] || ARTICLE_DICTIONARY[article.slug];
  if (dictEntry && dictEntry[code]) {
    const item = dictEntry[code];
    return {
      ...article,
      title: item.title,
      summary: item.summary,
      dialecticalTriad: {
        claim: item.claim || article.dialecticalTriad?.claim || '',
        counterClaim: item.counterClaim || article.dialecticalTriad?.counterClaim || '',
        whatIsNotEvidence: article.dialecticalTriad?.whatIsNotEvidence || '',
        methodologicalNote: article.dialecticalTriad?.methodologicalNote
      }
    };
  }

  // 3. Fallback for other articles: apply smart terminology translation
  return {
    ...article,
    title: translateTitleFallback(article.title, code),
    summary: translateSummaryFallback(article.summary, code)
  };
}

// Concept replacement dictionary for rapid high-accuracy fallback titles
const TITLE_CONCEPTS: Record<string, Record<string, string>> = {
  'Zamanın Simülasyon Yapısı ve Nöronal Zaman Algısı': {
    en: 'Simulation Structure of Time and Neuronal Time Perception',
    de: 'Simulationsstruktur der Zeit und neuronale Zeitwahrnehmung',
    fr: 'Structure de simulation du temps et perception neuronale',
    es: 'Estructura de simulación del tiempo y percepción neuronal',
    it: 'Struttura di simulazione del tempo e percezione neuronale',
    ru: 'Симуляционная структура времени и нейронное восприятие',
    ar: 'بنية محاكاة الزمان والإدراك العصبي للوقت',
    ja: '時間のシミュレーション構造と神経的時間知覚',
    zh: '时间的模拟结构与神经时间感知'
  },
  'Yaratma Sanatı ve Yapılabilecekler': {
    en: 'The Art of Creation and Potential Horizons',
    de: 'Die Kunst der Schöpfung und potentielle Horizonte',
    fr: "L'art de la création et les horizons possibles",
    es: 'El arte de la creación y los horizontes potenciales',
    it: "L'arte della creazione e gli orizzonti potenziali",
    ru: 'Искусство творения и потенциальные горизонты',
    ar: 'فن الخلق والآفاق الممكنة في التكنولوجيا',
    ja: '創造の技法と技術的可能性の地平',
    zh: '造物的艺术与技术潜能的边界'
  },
  'Beyin ve Kalp Arasındaki Farkın İnsan ile Diğer Canlılardaki Mahiyeti': {
    en: 'Ontological Difference Between Brain and Heart Across Living Beings',
    de: 'Der ontologische Unterschied zwischen Gehirn und Herz bei Lebewesen',
    fr: 'Différence ontologique entre le cerveau et le cœur chez les êtres vivants',
    es: 'Diferencia ontológica entre el cerebro y el corazón en los seres vivos',
    it: 'Differenza ontologica tra cervello e cuore negli esseri viventi',
    ru: 'Онтологическое различие между мозгом и сердцем у живых существ',
    ar: 'الفرق الوجودي بين الدماغ والقلب في الإنسان والكائنات الحية',
    ja: '脳と心の存在論的差異：人間と他生物の比較',
    zh: '大脑与心灵的本体论差异：人与其他生命的本质对比'
  },
  'Nasıralı İsa ve Tarih Boyunca Mesajının Algılanışı': {
    en: 'Jesus of Nazareth and the Historical Perception of His Message',
    de: 'Jesus von Nazareth und die historische Wahrnehmung seiner Botschaft',
    fr: 'Jésus de Nazareth et la perception historique de son message',
    es: 'Jesús de Nazaret y la percepción histórica de su mensaje',
    it: 'Gesù di Nazaret e la percezione storica del suo messaggio',
    ru: 'Иисус из Назарета и историческое восприятие его послания',
    ar: 'عيسى الناصري وتطور إدراك رسالته عبر التاريخ',
    ja: 'ナザレのイエスとそのメッセージの歴史的受容',
    zh: '拿撒勒人耶稣及其启示在历史长河中的受容'
  },
  'Evrenin Kapalı Devre Tasarımı ve Fazla Yüklerin Sistemden Uzaklaştırılması': {
    en: 'Closed-Circuit Design of the Universe and Entropic Load Dissipation',
    de: 'Geschlossener Schaltkreis des Universums und Entropieableitung',
    fr: 'Conception en circuit fermé de l’univers et dissipation entropique',
    es: 'Diseño de circuito cerrado del universo y disipación de sobrecargas',
    it: 'Design a circuito chiuso dell’universo e dissipazione entropica',
    ru: 'Замкнутая схемотехника Вселенной и отведение избыточной энтропии',
    ar: 'تصميم الدائرة المغلقة للكون وتصريف الأحمال الإنتروبية الزائدة',
    ja: '宇宙の閉回路設計とエントロピー負荷の系外排出',
    zh: '宇宙的闭合回路设计与过载熵流的系统排出'
  },
  'Gerçeklik Tek Boyutludur ve Onu Hiçbir Güç Yok Edemez': {
    en: 'Reality is One-Dimensional and Indestructible by Any Force',
    de: 'Die Wirklichkeit ist eindimensional und unzerstörbar',
    fr: 'La réalité est unidimensionnelle et aucune force ne peut la détruire',
    es: 'La realidad es unidimensional e indestructible por cualquier fuerza',
    it: 'La realtà è unidimensionale e nessuna forza può distruggerla',
    ru: 'Реальность одномерна, и никакая сила не способна её уничтожить',
    ar: 'الحقيقة أحادية البعد ولا تستطيع أي قوة إفناءها',
    ja: '実在は一元的であり、いかなる力もそれを破壊できない',
    zh: '实在是一维的，任何力量都无法将其摧毁'
  },
  'Hangi Zamanı Yaşamaktayız ve Zamanda Yolculuk Yapsak Biz Olarak Kalır Mıyız': {
    en: 'Which Time Do We Inhabit, and Would We Remain Ourselves in Time Travel?',
    de: 'Welche Zeit erleben wir und blieben wir dieselben bei Zeitreisen?',
    fr: 'Quel temps habitons-nous et resterions-nous nous-mêmes lors d’un voyage temporel ?',
    es: '¿Qué tiempo habitamos y seguiríamos siendo nosotros en un viaje temporal?',
    it: 'Quale tempo viviamo e rimarremmo noi stessi viaggiando nel tempo?',
    ru: 'В каком времени мы живём и останемся ли собой при путешествиях во времени?',
    ar: 'أي زمن نعيشه وهل سنبقى أنفسنا إذا سافرنا عبر الزمن؟',
    ja: '我々はいかなる時間を生きており、時間旅行をしても自己を保てるか？',
    zh: '我们究竟居于何种时间，时间旅行后我们还能保持自我吗？'
  },
  'Zamanın Ayrık Yapısı ve Yaratılış Süreci': {
    en: 'Discrete Structure of Time and the Creation Process',
    de: 'Diskrete Struktur der Zeit und der Schöpfungsprozess',
    fr: 'Structure discrète du temps et processus de création',
    es: 'Estructura discreta del tiempo y proceso de creación',
    it: 'Struttura discreta del tempo e processo di creazione',
    ru: 'Дискретная структура времени и процесс творения',
    ar: 'البنية المنفصلة للزمن وعملية الخلق الكونية',
    ja: '時間の離散的構造と宇宙創造のプロセス',
    zh: '时间的离散结构与宇宙创生过程'
  },
  "Big Bang'in Simetrisi: Madde-Enerji Dönüşümü ve Varoluşun Kökeni": {
    en: "Symmetry of the Big Bang: Matter-Energy Conversion and Origin of Existence",
    de: "Symmetrie des Urknalls: Materie-Energie-Umwandlung und Ursprung des Daseins",
    fr: "Symétrie du Big Bang: Conversion matière-énergie et origine de l’existence",
    es: "Simetría del Big Bang: Conversión materia-energía y origen de la existencia",
    it: "Simmetria del Big Bang: Conversione materia-energia e origine dell’esistenza",
    ru: "Симметрия Большого взрыва: Превращение материи и энергии и истоки бытия",
    ar: "تناظر الانفجار العظيم: تحول المادة والطاقة وأصل الوجود",
    ja: "ビッグバンの対称性：物質-エネルギー変換と存在の起源",
    zh: "大爆炸的对称性：质能转化与存在之源"
  }
};

function translateTitleFallback(title: string, langCode: string): string {
  const trimmed = title.trim();
  if (TITLE_CONCEPTS[trimmed] && TITLE_CONCEPTS[trimmed][langCode]) {
    return TITLE_CONCEPTS[trimmed][langCode];
  }

  // Look for partial key matches
  for (const [key, mapping] of Object.entries(TITLE_CONCEPTS)) {
    if (trimmed.includes(key) || key.includes(trimmed)) {
      if (mapping[langCode]) return mapping[langCode];
    }
  }

  return title;
}

function translateSummaryFallback(summary: string, langCode: string): string {
  // If target is Turkish, keep original
  if (langCode === 'tr') return summary;

  // If a known conceptual snippet exists, return localized summary note
  if (summary.includes('Big Bang') || summary.includes('Tekil Bir Olguydu')) {
    if (langCode === 'en') return 'An ontological inquiry into the phenomenon preceding the Big Bang and the cyclic existence-annihilation hypothesis of the cosmos.';
    if (langCode === 'de') return 'Eine ontologische Untersuchung des Phänomens vor dem Urknall und der zyklischen Kosmologie.';
  }

  return summary;
}
