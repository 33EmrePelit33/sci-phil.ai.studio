import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TOPIC_CLUSTERS, findClusterForArticle } from './topic-clusters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_URL = 'https://sci-phil.ai.studio';
let runtimeCatalog = null;

export function setRuntimeCatalog(catalog) {
  if (catalog && Array.isArray(catalog.posts)) runtimeCatalog = catalog;
}

function readCatalog() {
  if (runtimeCatalog && Array.isArray(runtimeCatalog.posts)) return runtimeCatalog;
  const candidates = [path.join(__dirname, 'catalog.json'), path.join(__dirname, 'public', 'catalog.json')];
  for (const file of candidates) {
    try {
      const data = JSON.parse(readFileSync(file, 'utf8'));
      if (Array.isArray(data.posts)) return data;
    } catch (_) { /* Try the next known catalogue location. */ }
  }
  return { posts: [], updatedAt: null };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function plainText(value) {
  return String(value ?? '')
    .replace(/<(script|style|noscript|svg|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim();
}

function safeArticleHtml(value) {
  let html = String(value ?? '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/<(script|style|iframe|object|embed|form|textarea|select|svg|math|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  html = html.replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math|template)\b[^>]*\/?\s*>/gi, '');
  html = html.replace(/\s+on[a-z0-9_-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = html.replace(/\s+(srcdoc|formaction)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = html.replace(/(href|src|xlink:href)\s*=\s*(["'])\s*(?:javascript|vbscript|data):.*?\2/gi, '$1="#"');
  return html;
}

const SECTOR_LOCALES = {
  tr: {
    labels: { definition: 'Sektör Tanımı', evaluation: 'Sektör Değerlendirmesi', thesis: 'Makalede ele alınan tez', relevance: 'Sektörle ilişkisi', opportunity: 'Olası katkı', method: 'Kanıt ve yöntem', limits: 'Sınırlar ve riskler', checks: 'Kontrol ölçütleri', metric: 'İzlenebilecek ölçüt', note: 'Bu içerik temelli analiz belirli bir kişinin veya kurumun görüşü değildir.' },
    opportunity: 'Bu konu; varsayımlar, hedeflenen kullanım ve başarı ölçütleri açıkça belirtilirse alan uygulamalarına katkı sağlayabilir.',
    method: 'Makalede sunulan iddia; dayanak, karşı kanıt, alternatif açıklama ve belirsizliklerden ayrı biçimde incelenmelidir. Kavramsal tutarlılık tek başına ampirik doğrulama değildir.',
    limits: 'Tek bir örnek, benzetme veya yorum genel geçer sonuç sayılmamalıdır. Tezin geçerli olduğu koşullar ve başarısız olabileceği durumlar ayrıca belirtilmelidir.',
    checks: ['Temel varsayımları ve tezin kapsamını açıkça tanımlayın.', 'En güçlü karşı savı ve alternatif açıklamaları karşılaştırın.', 'Sonuçları uygun veri, yöntem veya bağımsız doğrulama ile sınayın.'],
    metric: 'önceden tanımlanmış başarı ölçütleri, belirsizlikler ve tekrarlanabilirlik',
  },
  en: {
    labels: { definition: 'Sector Definition', evaluation: 'Sector Assessment', thesis: 'Thesis discussed in the article', relevance: 'Sector relevance', opportunity: 'Potential contribution', method: 'Evidence and method', limits: 'Limits and risks', checks: 'Review checks', metric: 'Possible metric', note: 'This content-based analysis is not a statement from a specific person or organization.' },
    opportunity: 'The topic may inform sector practice when assumptions, intended use and success criteria are stated clearly.',
    method: 'Assess the claim separately from supporting evidence, counterevidence, alternative explanations and uncertainty. Conceptual consistency alone is not empirical validation.',
    limits: 'A single example, analogy or interpretation should not be treated as a universal result. State the conditions in which the thesis applies and may fail.',
    checks: ['Define the core assumptions and scope of the thesis.', 'Compare the strongest counterargument and alternative explanations.', 'Test conclusions with suitable data, methods or independent validation.'],
    metric: 'predefined success criteria, uncertainty and reproducibility',
  },
  de: {
    labels: { definition: 'Sektorbeschreibung', evaluation: 'Sektorbewertung', thesis: 'Im Artikel untersuchte These', relevance: 'Bezug zum Sektor', opportunity: 'Möglicher Beitrag', method: 'Belege und Methode', limits: 'Grenzen und Risiken', checks: 'Prüfkriterien', metric: 'Möglicher Messwert', note: 'Diese inhaltsbezogene Analyse ist keine Aussage einer bestimmten Person oder Organisation.' },
    opportunity: 'Das Thema kann zur Praxis im Sektor beitragen, wenn Annahmen, Anwendungszweck und Erfolgskriterien klar benannt werden.',
    method: 'Die These ist getrennt von Belegen, Gegenbelegen, alternativen Erklärungen und Unsicherheiten zu prüfen. Begriffliche Konsistenz allein ist kein empirischer Nachweis.',
    limits: 'Ein einzelnes Beispiel, eine Analogie oder eine Deutung ist kein allgemeingültiges Ergebnis. Die Geltungsbedingungen und mögliche Fehlerfälle sind zu nennen.',
    checks: ['Grundannahmen und Geltungsbereich definieren.', 'Das stärkste Gegenargument und alternative Erklärungen vergleichen.', 'Schlussfolgerungen mit geeigneten Daten, Methoden oder unabhängiger Prüfung testen.'],
    metric: 'vorab definierte Erfolgskriterien, Unsicherheit und Reproduzierbarkeit',
  },
  fr: {
    labels: { definition: 'Définition du secteur', evaluation: 'Évaluation sectorielle', thesis: 'Thèse examinée dans l’article', relevance: 'Lien avec le secteur', opportunity: 'Contribution possible', method: 'Preuves et méthode', limits: 'Limites et risques', checks: 'Points de contrôle', metric: 'Indicateur possible', note: 'Cette analyse fondée sur le contenu ne représente pas l’avis d’une personne ou organisation précise.' },
    opportunity: 'Le sujet peut éclairer les pratiques du secteur si les hypothèses, l’usage visé et les critères de réussite sont clairement définis.',
    method: 'La thèse doit être examinée séparément des preuves, contre-preuves, explications alternatives et incertitudes. La cohérence conceptuelle ne constitue pas à elle seule une validation empirique.',
    limits: 'Un seul exemple, une analogie ou une interprétation ne constitue pas un résultat universel. Les conditions de validité et les cas d’échec doivent être indiqués.',
    checks: ['Définir les hypothèses principales et la portée de la thèse.', 'Comparer l’objection la plus solide et les explications alternatives.', 'Vérifier les conclusions avec des données, méthodes ou validations indépendantes adaptées.'],
    metric: 'critères de réussite définis à l’avance, incertitude et reproductibilité',
  },
  es: {
    labels: { definition: 'Definición del sector', evaluation: 'Evaluación sectorial', thesis: 'Tesis examinada en el artículo', relevance: 'Relación con el sector', opportunity: 'Contribución posible', method: 'Evidencia y método', limits: 'Límites y riesgos', checks: 'Criterios de revisión', metric: 'Indicador posible', note: 'Este análisis basado en el contenido no representa la opinión de una persona u organización concreta.' },
    opportunity: 'El tema puede aportar a la práctica del sector cuando se aclaran los supuestos, el uso previsto y los criterios de éxito.',
    method: 'La tesis debe examinarse por separado de las pruebas, contraejemplos, explicaciones alternativas e incertidumbres. La coherencia conceptual por sí sola no constituye validación empírica.',
    limits: 'Un ejemplo, analogía o interpretación aislados no constituyen un resultado universal. Deben indicarse las condiciones de validez y los posibles fallos.',
    checks: ['Definir los supuestos principales y el alcance de la tesis.', 'Comparar la objeción más sólida y las explicaciones alternativas.', 'Contrastar las conclusiones con datos, métodos o validación independiente adecuados.'],
    metric: 'criterios de éxito definidos de antemano, incertidumbre y reproducibilidad',
  },
};

const SECTOR_PROFILES = {
  ai: {
    tr: ['Yapay zekâ ve dijital teknoloji', 'Makine öğrenmesi, büyük dil modelleri, algoritmalar, yazılım ürünleri, otomasyon ve bunların tasarımı ile güvenli kullanımını kapsar.', 'Tez; model davranışının, yazılım mimarisinin veya otomatik kararların nasıl yorumlandığıyla ilişkilidir.', 'Akıcı çıktı tek başına bilinç, anlayış veya güvenilirlik kanıtı sayılmaz.'],
    en: ['Artificial intelligence and digital technology', 'Covers machine learning, large language models, algorithms, software products, automation, design and safe use.', 'The thesis relates to interpreting model behavior, software architecture or automated decisions.', 'Fluent output alone does not establish consciousness, understanding or reliability.'],
    de: ['Künstliche Intelligenz und digitale Technologie', 'Umfasst maschinelles Lernen, große Sprachmodelle, Algorithmen, Softwareprodukte, Automatisierung, Entwicklung und sichere Nutzung.', 'Die These betrifft die Interpretation von Modellverhalten, Softwarearchitektur oder automatisierten Entscheidungen.', 'Flüssige Ausgaben belegen allein weder Bewusstsein noch Verständnis oder Zuverlässigkeit.'],
    fr: ['Intelligence artificielle et technologie numérique', 'Couvre l’apprentissage automatique, les grands modèles de langage, les algorithmes, les logiciels, l’automatisation, la conception et l’usage sûr.', 'La thèse concerne l’interprétation du comportement des modèles, de l’architecture logicielle ou des décisions automatisées.', 'Une réponse fluide ne prouve à elle seule ni conscience, ni compréhension, ni fiabilité.'],
    es: ['Inteligencia artificial y tecnología digital', 'Incluye aprendizaje automático, grandes modelos de lenguaje, algoritmos, productos de software, automatización, diseño y uso seguro.', 'La tesis se relaciona con la interpretación del comportamiento de modelos, la arquitectura de software o las decisiones automatizadas.', 'Una respuesta fluida no demuestra por sí sola conciencia, comprensión ni fiabilidad.'],
  },
  physics: {
    tr: ['Fizik, matematik ve temel bilimler', 'Doğal olayların matematiksel modeller, gözlem, ölçüm ve tekrarlanabilir deneylerle açıklanmasını kapsar.', 'Tez; fiziksel bir yorum, matematiksel model veya doğa olaylarına ilişkin çıkarımla ilişkilidir.', 'Kuramsal yorum ve matematiksel tutarlılık, tek başına fiziksel gerçekliği kanıtlamaz.'],
    en: ['Physics, mathematics and fundamental sciences', 'Covers explanations of natural phenomena through mathematical models, observation, measurement and repeatable experiments.', 'The thesis relates to a physical interpretation, mathematical model or inference about nature.', 'A theoretical interpretation or mathematical consistency alone does not prove physical reality.'],
    de: ['Physik, Mathematik und Grundlagenwissenschaften', 'Umfasst Erklärungen natürlicher Phänomene durch mathematische Modelle, Beobachtung, Messung und wiederholbare Experimente.', 'Die These betrifft eine physikalische Deutung, ein mathematisches Modell oder einen Schluss über die Natur.', 'Eine theoretische Deutung oder mathematische Konsistenz allein beweist keine physikalische Realität.'],
    fr: ['Physique, mathématiques et sciences fondamentales', 'Couvre l’explication des phénomènes naturels par des modèles mathématiques, l’observation, la mesure et des expériences répétables.', 'La thèse porte sur une interprétation physique, un modèle mathématique ou une inférence sur la nature.', 'Une interprétation théorique ou une cohérence mathématique ne prouve pas à elle seule une réalité physique.'],
    es: ['Física, matemáticas y ciencias fundamentales', 'Abarca la explicación de fenómenos naturales mediante modelos matemáticos, observación, medición y experimentos repetibles.', 'La tesis se relaciona con una interpretación física, un modelo matemático o una inferencia sobre la naturaleza.', 'Una interpretación teórica o coherencia matemática no demuestra por sí sola la realidad física.'],
  },
  health: {
    tr: ['Sağlık ve yaşam bilimleri', 'Canlıların biyolojisini, sağlığı, hastalıkları, klinik uygulamaları ve canlı sistemleri araştıran alanları kapsar.', 'Tez; biyolojik süreç, beyin, davranış veya sağlık sonuçlarıyla ilişkili olabilir.', 'Genel yorumlar kişiye özgü tanı ya da tedavi önerisine dönüştürülmemelidir.'],
    en: ['Health and life sciences', 'Covers biology, health, disease, clinical practice and the study of living systems.', 'The thesis may relate to biological processes, the brain, behavior or health outcomes.', 'General interpretations should not be turned into personal diagnosis or treatment advice.'],
    de: ['Gesundheits- und Lebenswissenschaften', 'Umfasst Biologie, Gesundheit, Krankheiten, klinische Praxis und die Erforschung lebender Systeme.', 'Die These kann biologische Prozesse, Gehirn, Verhalten oder Gesundheitsergebnisse betreffen.', 'Allgemeine Deutungen dürfen nicht zu individueller Diagnose oder Therapieempfehlung werden.'],
    fr: ['Santé et sciences de la vie', 'Couvre la biologie, la santé, les maladies, la pratique clinique et l’étude des systèmes vivants.', 'La thèse peut concerner des processus biologiques, le cerveau, le comportement ou des résultats de santé.', 'Les interprétations générales ne doivent pas devenir des conseils individuels de diagnostic ou de traitement.'],
    es: ['Salud y ciencias de la vida', 'Incluye biología, salud, enfermedades, práctica clínica y estudio de sistemas vivos.', 'La tesis puede relacionarse con procesos biológicos, cerebro, conducta o resultados de salud.', 'Las interpretaciones generales no deben convertirse en consejos personales de diagnóstico o tratamiento.'],
  },
  business: {
    tr: ['Ekonomi, işletme ve çalışma hayatı', 'Üretim, tüketim, piyasalar, finans, teşvikler, kuruluşlar, emek ve kaynak dağılımını kapsar.', 'Tez; karar alma, maliyetler, ekonomik teşvikler veya kaynak dağılımıyla ilişkilidir.', 'Tek bir kuruluş veya örnekten bütün piyasalara genelleme yapılmamalıdır.'],
    en: ['Economics, business and work', 'Covers production, consumption, markets, finance, incentives, organizations, labor and resource allocation.', 'The thesis relates to decision-making, costs, economic incentives or resource allocation.', 'A single organization or example should not be generalized to all markets.'],
    de: ['Wirtschaft, Unternehmen und Arbeitswelt', 'Umfasst Produktion, Konsum, Märkte, Finanzen, Anreize, Organisationen, Arbeit und Ressourcenverteilung.', 'Die These betrifft Entscheidungen, Kosten, wirtschaftliche Anreize oder Ressourcenverteilung.', 'Ein einzelnes Unternehmen oder Beispiel darf nicht auf alle Märkte verallgemeinert werden.'],
    fr: ['Économie, entreprises et travail', 'Couvre la production, la consommation, les marchés, la finance, les incitations, les organisations, le travail et l’allocation des ressources.', 'La thèse concerne les décisions, les coûts, les incitations économiques ou l’allocation des ressources.', 'Un seul organisme ou exemple ne doit pas être généralisé à tous les marchés.'],
    es: ['Economía, empresas y trabajo', 'Incluye producción, consumo, mercados, finanzas, incentivos, organizaciones, trabajo y asignación de recursos.', 'La tesis se relaciona con decisiones, costes, incentivos económicos o asignación de recursos.', 'No debe generalizarse un solo organismo o ejemplo a todos los mercados.'],
  },
  education: {
    tr: ['Eğitim ve öğrenme bilimleri', 'Öğretim tasarımı, öğrenme süreçleri, eğitim kurumları ve ölçme-değerlendirmeyi kapsar.', 'Tez; öğrenme, öğretim, eğitim teknolojileri veya öğrenci gelişimiyle ilişkilidir.', 'Kısa süreli başarı veya memnuniyet tek başına kalıcı öğrenme kanıtı değildir.'],
    en: ['Education and learning sciences', 'Covers instructional design, learning processes, educational institutions and assessment.', 'The thesis relates to learning, teaching, educational technology or student development.', 'Short-term success or satisfaction alone does not prove lasting learning.'],
    de: ['Bildung und Lernwissenschaften', 'Umfasst Unterrichtsgestaltung, Lernprozesse, Bildungseinrichtungen und Leistungsbewertung.', 'Die These betrifft Lernen, Lehre, Bildungstechnologie oder die Entwicklung von Lernenden.', 'Kurzfristiger Erfolg oder Zufriedenheit allein belegen kein dauerhaftes Lernen.'],
    fr: ['Éducation et sciences de l’apprentissage', 'Couvre la conception pédagogique, les processus d’apprentissage, les établissements et l’évaluation.', 'La thèse concerne l’apprentissage, l’enseignement, la technologie éducative ou le développement des élèves.', 'La réussite ou la satisfaction à court terme ne prouve pas à elle seule un apprentissage durable.'],
    es: ['Educación y ciencias del aprendizaje', 'Incluye diseño didáctico, procesos de aprendizaje, instituciones educativas y evaluación.', 'La tesis se relaciona con aprendizaje, enseñanza, tecnología educativa o desarrollo estudiantil.', 'El éxito o la satisfacción a corto plazo no demuestra por sí solo un aprendizaje duradero.'],
  },
  environment: {
    tr: ['Çevre, enerji ve sürdürülebilirlik', 'Enerji sistemleri, iklim, ekoloji, doğal kaynaklar ve çevresel etkileri kapsar.', 'Tez; doğal sistemler, enerji kullanımı veya sürdürülebilir uygulamalarla ilişkilidir.', 'Tek bir gösterge ya da kısa dönemli kazanım toplam çevresel etkiyi temsil etmeyebilir.'],
    en: ['Environment, energy and sustainability', 'Covers energy systems, climate, ecology, natural resources and environmental impacts.', 'The thesis relates to natural systems, energy use or sustainable practices.', 'One indicator or short-term gain may not represent total environmental impact.'],
    de: ['Umwelt, Energie und Nachhaltigkeit', 'Umfasst Energiesysteme, Klima, Ökologie, natürliche Ressourcen und Umweltwirkungen.', 'Die These betrifft natürliche Systeme, Energienutzung oder nachhaltige Praktiken.', 'Ein einzelner Indikator oder kurzfristiger Gewinn bildet die Gesamtwirkung nicht unbedingt ab.'],
    fr: ['Environnement, énergie et durabilité', 'Couvre les systèmes énergétiques, le climat, l’écologie, les ressources naturelles et les impacts environnementaux.', 'La thèse concerne les systèmes naturels, l’utilisation de l’énergie ou les pratiques durables.', 'Un indicateur isolé ou un gain à court terme ne représente pas nécessairement l’impact total.'],
    es: ['Medio ambiente, energía y sostenibilidad', 'Abarca sistemas energéticos, clima, ecología, recursos naturales e impactos ambientales.', 'La tesis se relaciona con sistemas naturales, uso de energía o prácticas sostenibles.', 'Un indicador o beneficio a corto plazo puede no representar el impacto ambiental total.'],
  },
  society: {
    tr: ['Toplum, siyaset, hukuk ve kurumlar', 'Toplumsal ilişkiler, kamu politikası, siyasal sistemler, hukuk, haklar ve kurumsal kararları kapsar.', 'Tez; kurumların işleyişi, toplumsal davranış, haklar veya kamu politikasıyla ilişkilidir.', 'Normatif bir görüş veya tekil vaka, tek başına genel toplumsal sonuç kanıtı değildir.'],
    en: ['Society, politics, law and institutions', 'Covers social relations, public policy, political systems, law, rights and institutional decisions.', 'The thesis relates to institutions, social behavior, rights or public policy.', 'A normative view or single case alone does not establish a general social conclusion.'],
    de: ['Gesellschaft, Politik, Recht und Institutionen', 'Umfasst soziale Beziehungen, öffentliche Politik, politische Systeme, Recht, Rechte und institutionelle Entscheidungen.', 'Die These betrifft Institutionen, soziales Verhalten, Rechte oder öffentliche Politik.', 'Eine normative Position oder ein Einzelfall belegt allein keine allgemeine gesellschaftliche Schlussfolgerung.'],
    fr: ['Société, politique, droit et institutions', 'Couvre les relations sociales, les politiques publiques, les systèmes politiques, le droit, les droits et les décisions institutionnelles.', 'La thèse concerne les institutions, les comportements sociaux, les droits ou les politiques publiques.', 'Une opinion normative ou un cas isolé ne suffit pas à établir une conclusion sociale générale.'],
    es: ['Sociedad, política, derecho e instituciones', 'Incluye relaciones sociales, políticas públicas, sistemas políticos, derecho, derechos y decisiones institucionales.', 'La tesis se relaciona con instituciones, conducta social, derechos o políticas públicas.', 'Una opinión normativa o un caso aislado no establece por sí solo una conclusión social general.'],
  },
  philosophy: {
    tr: ['Felsefe, etik ve kavramsal analiz', 'Bilgi, gerçeklik, zihin, ahlak, mantık, varlık ve bilimin varsayımlarını inceleyen alanları kapsar.', 'Tez; temel kavramların anlamı, çıkarımların geçerliliği veya bilimsel bulguların yorumu ile ilişkilidir.', 'Tutarlı bir argüman, ampirik öncüllerin doğru olduğunu tek başına göstermez.'],
    en: ['Philosophy, ethics and conceptual analysis', 'Covers inquiry into knowledge, reality, mind, morality, logic, existence and the assumptions of science.', 'The thesis relates to concepts, the validity of inferences or interpretation of scientific findings.', 'A coherent argument alone does not establish the truth of empirical premises.'],
    de: ['Philosophie, Ethik und Begriffsanalyse', 'Umfasst Untersuchungen zu Wissen, Wirklichkeit, Geist, Moral, Logik, Sein und wissenschaftlichen Annahmen.', 'Die These betrifft Begriffe, die Gültigkeit von Schlussfolgerungen oder die Deutung wissenschaftlicher Befunde.', 'Ein schlüssiges Argument allein bestätigt keine empirischen Prämissen.'],
    fr: ['Philosophie, éthique et analyse conceptuelle', 'Couvre l’étude de la connaissance, de la réalité, de l’esprit, de la morale, de la logique, de l’existence et des présupposés scientifiques.', 'La thèse concerne les concepts, la validité des inférences ou l’interprétation de résultats scientifiques.', 'Un argument cohérent ne suffit pas à établir la vérité de prémisses empiriques.'],
    es: ['Filosofía, ética y análisis conceptual', 'Incluye el estudio del conocimiento, la realidad, la mente, la moral, la lógica, la existencia y los supuestos científicos.', 'La tesis se relaciona con conceptos, validez de inferencias o interpretación de resultados científicos.', 'Un argumento coherente por sí solo no demuestra la verdad de premisas empíricas.'],
  },
  general: {
    tr: ['Disiplinler arası bilim, teknoloji ve düşünce', 'Tek bir uzmanlık alanına indirgenemeyen; birden fazla disiplinden kavram veya yöntem kullanan konuları kapsar.', 'Tez, birden fazla alanın kavramlarıyla ilişkilendirilmeli ve her alana ait varsayımlar ayrı tutulmalıdır.', 'Disiplinler arası benzetme, aynı mekanizmanın işlediğini tek başına göstermez.'],
    en: ['Interdisciplinary science, technology and thought', 'Covers topics that draw on concepts or methods from multiple fields rather than one clear sector.', 'The thesis should be connected to each relevant field while keeping their assumptions distinct.', 'An interdisciplinary analogy alone does not show that the same mechanism is operating.'],
    de: ['Interdisziplinäre Wissenschaft, Technologie und Denken', 'Umfasst Themen, die Konzepte oder Methoden mehrerer Fachgebiete statt nur eines Sektors nutzen.', 'Die These sollte mit den relevanten Fachgebieten verknüpft werden, wobei deren Annahmen getrennt bleiben.', 'Eine interdisziplinäre Analogie zeigt allein nicht, dass derselbe Mechanismus wirkt.'],
    fr: ['Science, technologie et réflexion interdisciplinaires', 'Couvre les sujets mobilisant des concepts ou méthodes de plusieurs domaines plutôt que d’un seul secteur.', 'La thèse doit être reliée à chaque domaine pertinent tout en distinguant leurs hypothèses.', 'Une analogie interdisciplinaire ne prouve pas à elle seule qu’un même mécanisme est à l’œuvre.'],
    es: ['Ciencia, tecnología y pensamiento interdisciplinarios', 'Abarca temas que emplean conceptos o métodos de varias disciplinas y no de un único sector.', 'La tesis debe vincularse con cada campo pertinente manteniendo separados sus supuestos.', 'Una analogía interdisciplinaria no demuestra por sí sola que opere el mismo mecanismo.'],
  },
};

function getSectorKey(post) {
  const text = plainText(`${post.title || ''} ${post.excerpt || ''} ${post.claim || ''} ${post.categories || ''} ${String(post.content || '').slice(0, 12000)}`).toLocaleLowerCase(String(post.language || 'tr'));
  if (/\bllm\b|artificial intelligence|yapay zek|künstliche intelligenz|intelligence artificielle|inteligencia artificial|machine learning|sprachmodell|modèle de langage|modelo de lenguaje|algorithm|algoritm|robot|chatbot/.test(text)) return 'ai';
  if (/physic|fizik|quantum|kuantum|quanten|entrop|universe|universum|evren|cosmolog|kosmolog|space-time|raumzeit|uzay-zaman|relativity|görelilik|zeitwahrnehm|perception du temps|time perception/.test(text)) return 'physics';
  if (/health|sağlık|gesundheit|santé|salud|medical|medizin|médical|clínic|clinical|klinik|neuron|nöron|brain|gehirn|cerveau|cerebro|biology|biologie|biología/.test(text)) return 'health';
  if (/econom|ökonom|économ|economía|business|geschäft|entreprise|empresa|market|markt|marché|mercado|finance|finanz|financ/.test(text)) return 'business';
  if (/education|eğitim|learning|öğrenme|teaching|öğretim|schule|éducation|educación|school|école/.test(text)) return 'education';
  if (/climate|iklim|environment|çevre|umwelt|énergie|energy|enerji|sustainab|nachhaltig|sostenib|durabilité|ecolog/.test(text)) return 'environment';
  if (/politic|politik|politique|política|society|gesellschaft|société|sociedad|democracy|demokratie|démocratie|democracia|justice|gerechtigkeit|justicia|law|recht|droit|derecho/.test(text)) return 'society';
  if (/philosoph|felsefe|ethic|etik|moral|ontolog|epistemolog|metaphysic|metafizik|consciousness|conscience|bewusstsein|bilinç|şuur|realité|réalité|realidad|existence|existenz/.test(text)) return 'philosophy';
  return 'general';
}

function buildSectorEvaluationHtml(post) {
  const supported = ['tr', 'en', 'de', 'fr', 'es'];
  const requested = String(post.language || 'tr').toLowerCase();
  const lang = supported.includes(requested) ? requested : 'tr';
  const labels = SECTOR_LOCALES[lang].labels;
  const sectorKey = getSectorKey(post);
  const profile = SECTOR_PROFILES[sectorKey][lang] || SECTOR_PROFILES.general[lang];
  const claim = plainText(post.claim || post.excerpt || post.title || '').slice(0, 480);
  const sectorName = profile[0];
  const definition = profile[1];
  const relevance = profile[2];
  const limits = profile[3];
  const thesis = claim || String(post.title || '');
  const copy = SECTOR_LOCALES[lang];
  const checks = copy.checks.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  return `<section class="sector-analysis" aria-label="${escapeHtml(labels.evaluation)}"><p class="sector-kicker">${escapeHtml(sectorName)}</p><h2>${escapeHtml(labels.definition)}</h2><p>${escapeHtml(definition)}</p><div class="sector-thesis"><strong>${escapeHtml(labels.thesis)}</strong><p>${escapeHtml(thesis)}</p></div><h2>${escapeHtml(labels.evaluation)}</h2><h3>${escapeHtml(labels.relevance)}</h3><p>${escapeHtml(relevance)}</p><h3>${escapeHtml(labels.opportunity)}</h3><p>${escapeHtml(copy.opportunity)}</p><h3>${escapeHtml(labels.method)}</h3><p>${escapeHtml(copy.method)}</p><h3>${escapeHtml(labels.limits)}</h3><p>${escapeHtml(limits)} ${escapeHtml(copy.limits)}</p><h3>${escapeHtml(labels.checks)}</h3><ul>${checks}</ul><p><strong>${escapeHtml(labels.metric)}:</strong> ${escapeHtml(copy.metric)}.</p><p class="sector-note">${escapeHtml(labels.note)}</p></section>`;
}

function buildSectorCardText(post) {
  const lang = ['tr', 'en', 'de', 'fr', 'es'].includes(String(post.language || '').toLowerCase()) ? String(post.language).toLowerCase() : 'tr';
  const profile = SECTOR_PROFILES[getSectorKey(post)][lang] || SECTOR_PROFILES.general[lang];
  const title = ({tr:'Sektör Tanımı',en:'Sector',de:'Sektor',fr:'Secteur',es:'Sector'})[lang];
  const assessment = ({tr:'Sektör değerlendirmesi',en:'Sector assessment',de:'Sektorbewertung',fr:'Évaluation sectorielle',es:'Evaluación sectorial'})[lang];
  return `<p class="sector-card-definition"><strong>${escapeHtml(title)}: ${escapeHtml(profile[0])}.</strong> ${escapeHtml(profile[1])}</p><p class="sector-card-assessment"><strong>${escapeHtml(assessment)}:</strong> ${escapeHtml(profile[2])} ${escapeHtml(profile[3])}</p>`;
}

function isoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function articlePath(post) {
  return `/makale/${encodeURIComponent(String(post.slug || `makale-${post.id || ''}`).trim())}`;
}

function xmlEscape(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function getBaseUrl(_req) {
  // Canonical URLs must not be derived from arbitrary Host/X-Forwarded-* headers.
  return SITE_URL;
}

export function renderSitemap(catalog, baseUrl = SITE_URL) {
  const posts = Array.isArray(catalog.posts) ? catalog.posts : [];
  const entries = [{ loc: `${baseUrl}/`, lastmod: isoDate(catalog.updatedAt), priority: '1.0', changefreq: 'daily', title: 'Science & Philosophy | Emre Pelit' }];
  for (const post of posts) {
    if (!post?.slug || !post?.title) continue;
    entries.push({
      loc: `${baseUrl}${articlePath(post)}`,
      lastmod: isoDate(post.updated || post.published || catalog.updatedAt),
      priority: '0.8',
      changefreq: 'weekly',
      title: String(post.title || '').trim()
    });
  }
  entries.push({ loc: `${baseUrl}/analytics.html`, lastmod: isoDate(catalog.updatedAt), priority: '0.7', changefreq: 'daily', title: 'Analytics & Global Benchmarks' });
  const urlEntries = entries.map(({ loc, lastmod, priority, changefreq, title }) => 
    `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>${changefreq || 'weekly'}</changefreq>\n    <priority>${priority || '0.8'}</priority>\n    <image:image>\n      <image:loc>${baseUrl}/emre-pelit.jpg</image:loc>\n      <image:title>${xmlEscape(title || 'Emre Pelit')}</image:title>\n    </image:image>\n  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlEntries}\n</urlset>\n`;
}

/**
 * Rebuild the static, crawlable archive list from the live catalog at request time.
 * This keeps Blogger posts added after deployment discoverable without waiting
 * for a frontend JavaScript render or a full rebuild.
 */
export function injectSearchableArticleIndex(html, catalog) {
  const posts = (Array.isArray(catalog?.posts) ? catalog.posts : [])
    .filter(post => post && post.slug && post.title)
    .slice()
    .sort((a, b) => new Date(b.updated || b.published || 0) - new Date(a.updated || a.published || 0));
  if (!posts.length) return html;

  const items = posts.map(post => {
    const href = escapeHtml(articlePath(post));
    const title = escapeHtml(post.title);
    const langCode = String(post.language || '').toLowerCase();
    const lang = escapeHtml(post.languageName || ({tr:'Türkçe',en:'English',de:'Deutsch',fr:'Français',es:'Español'}[langCode] || langCode || 'Dil belirtilmemiş'));
    return `          <li><a href="${href}">${title}</a> <span>(${lang})</span></li>`;
  }).join('\n');
  const section = `    <section class="seo-article-index" aria-label="Makale arşivi">\n` +
    `      <details open>\n        <summary style="cursor:pointer;user-select:none;font-weight:700;font-size:1.05rem;padding:0.4rem 0;color:#fbbf24">Makale Arşivi — ${posts.length} makale</summary>\n` +
    `        <p>Bilim, felsefe, kozmoloji, zihin, yapay zekâ bilinci ve epistemoloji alanlarındaki yazılara doğrudan erişin.</p>\n` +
    `        <p style="color:#7dd3fc;font-size:0.85rem;margin:.5rem 0"><strong>İç Linkleme &amp; Otorite Ağı:</strong> science-philosophy.ai.studio arşivi kalıcı olarak <a href="https://sci-phil.ai.studio/" style="color:#fde047">sci-phil.ai.studio</a> üzerinde birleştirilmiştir.</p>\n` +
    `        <ul>\n${items}\n        </ul>\n      </details>\n    </section>`;
  const sectionPattern = /<section\b(?=[^>]*\bclass=["'][^"']*\bseo-article-index\b[^"']*["'])[^>]*>[\s\S]*?<\/section>/i;
  if (sectionPattern.test(html)) return html.replace(sectionPattern, section);
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${section}\n  </body>`) : `${html}\n${section}`;
}

function renderArchiveCards(posts) {
  return posts.slice().sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0)).map(post => {
    const href = escapeHtml(articlePath(post));
    const title = escapeHtml(post.title || 'Başlıksız makale');
    const lang = escapeHtml(post.languageName || post.language || 'Dil belirtilmemiş');
    const category = escapeHtml((post.categories || ['Bilim & Felsefe'])[0]);
    const excerpt = escapeHtml(plainText(post.excerpt || post.claim || post.content).slice(0, 190));
    const reading = escapeHtml(post.readingTime || '3 dk');
    return `<article class="article-card seo-article-card"><div class="card-meta"><span>⏱️ ${reading}</span> · <span class="lang-tag">${lang}</span> · <span style="color:#38bdf8;font-weight:600">${category}</span></div><h3 class="card-title"><a class="seo-article-link" href="${href}" style="color:inherit;text-decoration:none">${title}</a></h3><p class="card-snippet">${excerpt}</p>${buildSectorCardText(post)}<div class="card-footer"><span style="font-size:.8rem;color:#94a3b8">✍️ Emre Pelit</span><a href="${href}" class="btn-read-label" aria-label="${title} makalesini oku" style="text-decoration:none">Makaleyi oku →</a></div></article>`;
  }).join('\n');
}

// Replace the entire card container, even when index.html contains stale static cards.
function replaceArticleGrid(html, cards) {
  const opening = /<div\b(?=[^>]*\bid=["']article-grid["'])(?=[^>]*\bclass=["'][^"']*\barticles-grid\b[^"']*["'])[^>]*>/i.exec(html);
  if (!opening) return html;
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = opening.index;
  let depth = 0;
  let match;
  while ((match = tags.exec(html))) {
    if (/^<\s*\/div/i.test(match[0])) depth--;
    else if (!/\/\s*>$/.test(match[0])) depth++;
    if (depth === 0) {
      return html.slice(0, opening.index + opening[0].length) + cards + html.slice(match.index);
    }
  }
  return html;
}

function buildCleanMetaDescription(post) {
  const claim = plainText(post.claim || '');
  const excerpt = plainText(post.excerpt || '');
  const content = plainText(post.content || '');
  let raw = claim || excerpt || content || String(post.title || '');
  raw = raw.replace(/\s+/g, ' ').trim();
  if (raw.length <= 155) return raw;
  const sliced = raw.slice(0, 155);
  const lastSpace = sliced.lastIndexOf(' ');
  const clean = (lastSpace > 60 ? sliced.slice(0, lastSpace) : sliced).trim();
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function buildTopicClusterHtml(post, posts) {
  const cluster = findClusterForArticle(post.slug);
  if (!cluster) return '';
  const relatedPosts = posts.filter(p => p && p.slug && (cluster.pillarSlug === p.slug || cluster.subSlugs.includes(p.slug)) && p.slug !== post.slug);
  const links = relatedPosts.map(p => `<li><a href="${articlePath(p)}">${escapeHtml(p.title)}</a></li>`).join('');
  return `
<section class="topic-cluster-box" aria-label="Bağlı Konu Kümesi (Topic Cluster)">
  <span class="cluster-badge">📌 Konu Kümesi: ${escapeHtml(cluster.name)}</span>
  <p class="cluster-desc">${escapeHtml(cluster.description)}</p>
  <p class="cluster-focus"><strong>Diyalektik Odak:</strong> ${escapeHtml(cluster.dialecticalFocus)}</p>
  ${links ? `<div class="cluster-links"><strong>Kümedeki Diğer Makaleler (İç Link Ağı):</strong><ul>${links}</ul></div>` : ''}
</section>`;
}

function buildDeepeningSection(post, baseUrl) {
  return `
<section class="deepening-section" aria-label="Diyalektik Derinleşme ve Kaynakça">
  <h2>Diyalektik Derinleşme &amp; Literatür Çerçevesi (E-E-A-T)</h2>
  <p>Bu makaledeki savlar; analitik zihin felsefesi, teorik fizik ve epistemolojik metodoloji ilkeleriyle temellendirilmiştir. Konuyu derinleştirmek için eleştirel sorular:</p>
  <ul class="deepening-questions">
    <li><strong>Varsayım Analizi:</strong> Tezin dayandığı aksiyomlar bağımsız ampirik kanıtlarla mı yoksa analojik çıkarımlarla mı desteklenmektedir?</li>
    <li><strong>Antitez Karşılaştırması:</strong> En güçlü zıt argüman hangi koşulda bu savı geçersiz kılabilir?</li>
    <li><strong>Sentez &amp; Uygulama:</strong> Bu çıkarım insan zihni, yapay zekâ ontolojisi veya kozmolojik modelleme açısından ne tür yeni bir kavrayış sunar?</li>
  </ul>
  <div class="author-eeat-card">
    <div class="eeat-avatar"><img src="${baseUrl}/author.jpg" alt="Emre Pelit" width="56" height="56" style="border-radius:12px;border:2px solid #f59e0b"></div>
    <div class="eeat-info">
      <strong style="color:#f8fafc;font-size:1.05rem">Yazar: Emre Pelit</strong> — <span style="color:#f59e0b;font-weight:600">Bilim &amp; Zihin Felsefesi Araştırmacısı</span>
      <p style="margin:4px 0 8px;font-size:0.88rem;color:#94a3b8">Büyük Dil Modelleri, yapay zeka ontolojisi, zaman algısı ve zihin felsefesi üzerine eleştirel felsefi yayınlar.</p>
      <div class="eeat-links" style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.82rem">
        <a href="https://emrepelit7337.blogspot.com" target="_blank" rel="noopener noreferrer" style="color:#38bdf8">Blogger ↗</a>
        <a href="https://www.researchgate.net/profile/Emre-Pelit?ev=hdr_xprf" target="_blank" rel="noopener noreferrer" style="color:#38bdf8">ResearchGate ↗</a>
        <a href="https://medium.com/@emrepelit39" target="_blank" rel="noopener noreferrer" style="color:#38bdf8">Medium ↗</a>
        <a href="https://www.linkedin.com/in/emrepelit109" target="_blank" rel="noopener noreferrer" style="color:#38bdf8">LinkedIn ↗</a>
      </div>
    </div>
  </div>
  <div class="crosslink-note" style="margin-top:14px;padding:12px;border-radius:10px;background:#0c1626;border:1px solid #233857;font-size:0.86rem;color:#cbd5e1">
    <strong>Siteler Arası Doğal Otorite Bağlantısı:</strong>
    Tam arşiv, kaynakça ve interaktif felsefe laboratuvarı için <a href="${baseUrl}/" style="color:#38bdf8;font-weight:700">sci-phil.ai.studio</a> ana kürsüsünü ziyaret edebilirsiniz.
  </div>
</section>`;
}

function renderArticlePage(post, posts, baseUrl = SITE_URL) {
  const lang = /^[a-z]{2}$/i.test(String(post.language || '')) ? String(post.language).toLowerCase() : 'tr';
  const canonical = `${baseUrl}${articlePath(post)}`;
  const originalTitle = String(post.title || 'Science & Philosophy');
  const pageTitle = escapeHtml(`${originalTitle} | Science & Philosophy – Emre Pelit`);
  const description = escapeHtml(buildCleanMetaDescription(post));
  const publishedIso = post.published && !Number.isNaN(new Date(post.published).getTime()) ? new Date(post.published).toISOString() : undefined;
  const updatedIso = post.updated && !Number.isNaN(new Date(post.updated).getTime()) ? new Date(post.updated).toISOString() : publishedIso;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: originalTitle,
    description: plainText(buildCleanMetaDescription(post)),
    datePublished: publishedIso, dateModified: updatedIso,
    author: {
      '@type': 'Person',
      name: 'Emre Pelit',
      jobTitle: 'Bilim ve Zihin Felsefesi Araştırmacısı',
      url: `${baseUrl}/`,
      sameAs: [
        'https://emrepelit7337.blogspot.com',
        'https://www.researchgate.net/profile/Emre-Pelit?ev=hdr_xprf',
        'https://medium.com/@emrepelit39',
        'https://www.linkedin.com/in/emrepelit109'
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: 'Science & Philosophy',
      url: `${baseUrl}/`,
      logo: { '@type': 'ImageObject', url: `${baseUrl}/author.jpg` }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }, image: `${baseUrl}/author.jpg`,
    inLanguage: lang, articleSection: Array.isArray(post.categories) ? post.categories : ['Bilim & Felsefe']
  }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  const content = safeArticleHtml(post.content || `<p>${escapeHtml(post.excerpt || '')}</p>`);
  const epistemology = [
    post.claim ? `<section class="epistemology"><h2>Temel iddia</h2><p>${escapeHtml(post.claim)}</p></section>` : '',
    post.counterClaim ? `<section class="epistemology"><h2>Karşı iddia</h2><p>${escapeHtml(post.counterClaim)}</p></section>` : '',
    post.notProof ? `<section class="epistemology"><h2>Neyin kanıtı değildir?</h2><p>${escapeHtml(post.notProof)}</p></section>` : ''
  ].join('');
  const index = posts.findIndex(item => item.slug === post.slug);
  const prev = index > 0 ? posts[index - 1] : null;
  const next = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;
  const prevLink = prev ? `<a rel="prev" href="${escapeHtml(articlePath(prev))}">← ${escapeHtml(prev.title)}</a>` : '';
  const nextLink = next ? `<a rel="next" href="${escapeHtml(articlePath(next))}">${escapeHtml(next.title)} →</a>` : '';
  const sourceLink = post.originalUrl && /^https:\/\//i.test(post.originalUrl) ? `<a href="${escapeHtml(post.originalUrl)}" target="_blank" rel="noopener noreferrer">Orijinal Blogger yazısı ↗</a>` : '';
  const articleData = JSON.stringify({
    id: String(post.id || post.slug || ''),
    slug: String(post.slug || ''),
    title: originalTitle,
    summary: String(post.excerpt || post.summary || ''),
    content: String(post.content || ''),
    language: lang,
    claim: String(post.claim || ''),
    counterClaim: String(post.counterClaim || ''),
    notProof: String(post.notProof || ''),
    fromToEvolution: String(post.fromToEvolution || '')
  }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

  return `<!doctype html>
<html lang="${lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pageTitle}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${escapeHtml(canonical)}">
<link rel="alternate" hreflang="tr" href="${escapeHtml(canonical)}">
<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}">
<meta name="author" content="Emre Pelit">
<meta property="og:type" content="article"><meta property="og:site_name" content="Science &amp; Philosophy | Emre Pelit"><meta property="og:title" content="${escapeHtml(originalTitle)}"><meta property="og:description" content="${description}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${baseUrl}/author.jpg"><meta property="og:locale" content="${lang === 'tr' ? 'tr_TR' : lang}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(originalTitle)}"><meta name="twitter:description" content="${description}">
<script type="application/ld+json">${jsonLd}</script>
<style>
:root{color-scheme:dark;--bg:#0b1120;--panel:#131c31;--line:#263550;--text:#f1f5f9;--muted:#aab8d0;--blue:#38bdf8;--gold:#d4af37}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:17px/1.8 system-ui,-apple-system,"Segoe UI",sans-serif}.wrap{width:min(900px,calc(100% - 32px));margin:auto}.top{padding:20px 0;border-bottom:1px solid var(--line)}.top .wrap{display:flex;justify-content:space-between;align-items:center;gap:14px}.brand{color:var(--gold);font-weight:800;text-decoration:none}.analytics-nav{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;border:1px solid #365070;border-radius:10px;background:#13243d;color:var(--blue);text-decoration:none;font-weight:800;font-size:.82rem;white-space:nowrap}.analytics-nav:hover{background:#1a2b48}.crumbs{color:var(--muted);font-size:.9rem;margin:24px 0}.crumbs a,.nav a{color:var(--blue)}h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.2;margin:0 0 18px}h2{line-height:1.3}a{overflow-wrap:anywhere}.meta{color:var(--muted);font-size:.94rem;margin:14px 0 26px}.reader-tools{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:16px;margin:26px 0;display:flex;gap:10px;flex-wrap:wrap;align-items:center}.reader-tools button,.reader-tools select{background:#1b2a44;color:var(--text);border:1px solid #385174;border-radius:8px;padding:10px 12px;font:inherit}.status{flex-basis:100%;color:var(--muted);font-size:.9rem}.epistemology{margin:18px 0;padding:16px;border:1px solid #365070;border-radius:12px;background:#101a2d}.epistemology h2{font-size:1.05rem;margin:0 0 6px;color:var(--gold)}.sector-analysis{margin:28px 0;padding:20px;border:1px solid #3b4f70;border-radius:16px;background:linear-gradient(145deg,#131c31,#0f1729)}.sector-analysis h2{margin:18px 0 8px;font-size:1.35rem;color:var(--gold)}.sector-analysis h2:first-of-type{margin-top:8px}.sector-analysis h3{margin:16px 0 5px;font-size:1rem;color:var(--blue)}.sector-analysis p,.sector-analysis li{font-size:.9rem;line-height:1.7}.sector-kicker{display:inline-block;border:1px solid #45618a;border-radius:999px;padding:3px 9px;font-size:.8rem;color:#c7d8f5;font-weight:700;margin:0}.sector-thesis{padding:14px;background:#0b1324;border:1px solid #263550;border-radius:12px;margin:16px 0}.sector-thesis p{margin:6px 0 0}.sector-analysis ul{padding-left:22px}.sector-note{color:var(--muted);border-top:1px solid var(--line);padding-top:12px;margin-top:18px;font-size:.8rem!important}.sector-card-definition,.sector-card-assessment{font-size:.83rem;line-height:1.55;color:var(--muted);margin:10px 0}.sector-card-definition strong,.sector-card-assessment strong{color:var(--blue)}.article-body{overflow-wrap:anywhere}.article-body img,.article-body video{max-width:100%;height:auto}.article-body pre{max-width:100%;overflow:auto;background:#111b2e;padding:12px;border-radius:8px}.article-body table{display:block;max-width:100%;overflow:auto;border-collapse:collapse}.article-body td,.article-body th{padding:6px;border:1px solid var(--line)}.article-body blockquote{border-left:3px solid var(--blue);padding-left:16px;color:var(--muted)}.nav{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:30px 0}.nav a{max-width:48%}footer{border-top:1px solid var(--line);padding:24px 0 40px;color:var(--muted);font-size:.9rem}
.topic-cluster-box{margin:24px 0;padding:18px;border:1px solid #38bdf8;border-radius:14px;background:linear-gradient(145deg,#0c1d36,#10223d)}.cluster-badge{display:inline-block;padding:4px 10px;border-radius:8px;background:#0284c7;color:#fff;font-weight:750;font-size:0.82rem;margin-bottom:8px}.cluster-desc{font-size:0.92rem;color:#cbd5e1;margin:6px 0}.cluster-focus{font-size:0.88rem;color:#93c5fd;margin:4px 0}.cluster-links{margin-top:10px;font-size:0.88rem}.cluster-links ul{margin:6px 0 0;padding-left:20px}.cluster-links li{margin-bottom:4px}.deepening-section{margin:30px 0;padding:22px;border:1px solid #f59e0b;border-radius:16px;background:linear-gradient(145deg,#1c1917,#141210)}.deepening-section h2{color:#f59e0b;font-size:1.25rem;margin:0 0 10px}.deepening-questions{margin:10px 0;padding-left:20px;font-size:0.9rem;color:#d6d3d1;line-height:1.7}.author-eeat-card{display:flex;gap:14px;align-items:flex-start;padding:14px;border-radius:12px;background:#09090b;border:1px solid #27272a;margin-top:16px}@media(prefers-color-scheme:light){:root{color-scheme:light;--bg:#f8fafc;--panel:#fff;--line:#dce4ef;--text:#0f172a;--muted:#526174}}
</style><script defer src="/web-vitals-reporter.js"></script><script defer src="/analytics-tracker.js"></script></head><body>
<header class="top"><div class="wrap"><a class="brand" href="/">Science &amp; Philosophy · Emre Pelit</a><a class="analytics-nav" href="/analytics.html" aria-label="Canlı Analytics panelini aç">▥ Live Analytics ↗</a></div></header>
<main class="wrap"><nav class="crumbs" aria-label="Ekmek kırıntısı"><a href="/">Ana sayfa</a> / <a href="/#kulliyat">Bilim ve Felsefe Makaleleri</a></nav>
<article><header><h1 id="article-title">${escapeHtml(originalTitle)}</h1><div class="meta">Yazar: Emre Pelit · Dil: ${escapeHtml(post.languageName || lang)} · Yayın: ${escapeHtml(String(post.published || '').slice(0, 10) || 'Tarih belirtilmemiş')} · Okuma süresi: ${escapeHtml(post.readingTime || '3 dk')}</div></header>
${epistemology}<div class="reader-tools" role="group" aria-label="Makale çeviri ve sesli okuma araçları"><label for="translate-language">Dil:</label><select id="translate-language"><option value="tr">Türkçe</option><option value="en">English</option><option value="de">Deutsch</option><option value="fr">Français</option><option value="es">Español</option><option value="it">Italiano</option><option value="ru">Русский</option><option value="ar">العربية</option><option value="ja">日本語</option><option value="zh">中文</option><option value="pt">Português</option></select><button id="translate-article" type="button">🌐 Dile çevir</button><button id="speak-article" type="button">🔊 Sesli oku</button><button id="pause-article" type="button">⏸ Duraklat / sürdür</button><button id="stop-article" type="button">⏹ Durdur</button><p id="reader-status" class="status" role="status" aria-live="polite">Sesli okuma tarayıcı/işletim sistemi seslerine bağlıdır. Çeviri için sunucuda GEMINI_API_KEY ayarlanmalıdır.</p></div>
<div id="article-body" class="article-body">${content}</div>${buildSectorEvaluationHtml(post)}${buildTopicClusterHtml(post, posts)}${buildDeepeningSection(post, baseUrl)}<p>${sourceLink}</p></article>
<nav class="nav" aria-label="Diğer makaleler">${prevLink}${nextLink}</nav><p><a href="/">← Tüm makaleler arşivine dön</a> · <a href="/analytics.html">Salt okunur Analytics paneli</a></p></main><footer><div class="wrap">© 2026 Emre Pelit · Science &amp; Philosophy</div></footer>
<script id="article-data" type="application/json">${articleData}</script><script>
(function(){const data=JSON.parse(document.getElementById('article-data').textContent);const language=document.getElementById('translate-language');const status=document.getElementById('reader-status');const title=document.getElementById('article-title');const body=document.getElementById('article-body');const originalTitle=data.title;const originalContent=data.content;const badTags='script,style,iframe,object,embed,form,textarea,select,svg,math,template';
function safeHTML(value){const doc=new DOMParser().parseFromString(String(value||''),'text/html');doc.querySelectorAll(badTags).forEach(el=>el.remove());doc.querySelectorAll('*').forEach(el=>Array.from(el.attributes).forEach(attr=>{const name=attr.name.toLowerCase(),val=attr.value.trim();if(name.startsWith('on')||name==='srcdoc'||name==='formaction')el.removeAttribute(attr.name);else if(['href','src','xlink:href'].includes(name)&&/^(javascript|vbscript|data):/i.test(val))el.removeAttribute(attr.name);}));return doc.body.innerHTML;}
document.getElementById('translate-article').addEventListener('click',async function(){if(language.value===data.language){status.textContent='Makale zaten bu dilde. Başka bir dil seçebilirsiniz.';return;}this.disabled=true;status.textContent='Makalenin tam çevirisi hazırlanıyor…';try{const response=await fetch('/api/gemini/translate',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({articleId:data.id,slug:data.slug,title:originalTitle,summary:data.summary,content:originalContent,dialecticalTriad:{claim:data.claim,counterClaim:data.counterClaim,whatIsNotEvidence:data.notProof,methodologicalNote:data.fromToEvolution},sourceLanguageCode:data.language||'tr',targetLanguage:language.options[language.selectedIndex].textContent||language.value,targetLanguageCode:language.value})});const result=await response.json();if(!response.ok||result.success!==true||!result.data)throw new Error(result.error||'Tam çeviri yanıtı alınamadı.');const translated=result.data;if(originalContent&&!translated.translatedContent)throw new Error('Makale gövdesi çevrilmedi; özgün metin korundu.');title.textContent=translated.translatedTitle||originalTitle;body.innerHTML=safeHTML(translated.translatedContent||originalContent);document.documentElement.lang=language.value;status.textContent='Makale başlığı ve gövdesi çevrildi. Yeniden yüklenince özgün dil gösterilir.';}catch(error){status.textContent=(error&&error.message)||'Çeviri tamamlanamadı. Kaynak metin değiştirilmedi.';}finally{this.disabled=false;}});
document.getElementById('speak-article').addEventListener('click',function(){if(!('speechSynthesis'in window)){status.textContent='Bu tarayıcı sesli okumayı desteklemiyor.';return;}window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance((title.textContent+' . '+body.innerText).slice(0,120000));utterance.lang=language.value||data.language||'tr';utterance.onstart=()=>status.textContent='Sesli okuma başladı.';utterance.onend=()=>status.textContent='Sesli okuma tamamlandı.';utterance.onerror=()=>status.textContent='Sesli okuma tamamlanamadı.';window.speechSynthesis.speak(utterance);});
document.getElementById('pause-article').addEventListener('click',function(){if(!('speechSynthesis'in window))return;if(window.speechSynthesis.paused)window.speechSynthesis.resume();else if(window.speechSynthesis.speaking)window.speechSynthesis.pause();});document.getElementById('stop-article').addEventListener('click',function(){if('speechSynthesis'in window)window.speechSynthesis.cancel();status.textContent='Sesli okuma durduruldu.';});})();
</script></body></html>`;
}


export function registerSeoRoutes(app, options = {}) {
  const includeHome = options.includeHome !== false;
  app.get('/robots.txt', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-Mobile
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Yandex
Allow: /

User-agent: YandexBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: Slurp
Allow: /

Host: ${baseUrl}
Sitemap: ${baseUrl}/sitemap.xml
`;
    res.type('text/plain; charset=utf-8').set('Cache-Control', 'public, max-age=600').send(robotsTxt);
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.set('Cache-Control', 'public, max-age=300').type('application/xml; charset=utf-8').send(renderSitemap(readCatalog(), baseUrl));
  });

  app.get('/makale/:slug', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const catalog = readCatalog();
    const posts = Array.isArray(catalog.posts) ? catalog.posts : [];
    const requestedSlug = String(req.params.slug || '').toLowerCase();
    const post = posts.find(item =>
      String(item.slug || '').toLowerCase() === requestedSlug ||
      String(item.id || '').toLowerCase() === requestedSlug ||
      (item.id && (requestedSlug.endsWith(String(item.id).toLowerCase()) || requestedSlug.includes(String(item.id).toLowerCase())))
    );
    if (!post) return res.status(404).set('Content-Type', 'text/plain; charset=utf-8').send('404 - Makale bulunamadı');
    // Older /makale/<id> links remain useful, but each one points to the canonical slug.
    const canonicalPath = articlePath(post);
    if (req.params.slug !== post.slug) return res.redirect(301, canonicalPath);
    res.set('Cache-Control', 'public, max-age=300').set('Content-Type', 'text/html; charset=utf-8').send(renderArticlePage(post, posts, baseUrl));
  });

  if (includeHome) {
    app.get('/', (_req, res) => {
      try {
        const catalog = readCatalog();
        const posts = Array.isArray(catalog.posts) ? catalog.posts.filter(p => p && p.slug && p.title) : [];
        let page = readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        const cards = renderArchiveCards(posts);
        page = replaceArticleGrid(page, cards);
        res.set('Cache-Control', 'public, max-age=300').set('Content-Type', 'text/html; charset=utf-8').send(page);
      } catch (err) {
        res.status(500).set('Content-Type', 'text/plain; charset=utf-8').send('Site ana sayfası hazırlanamadı.');
      }
    });
  }
}
