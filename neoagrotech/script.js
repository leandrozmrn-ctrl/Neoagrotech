/* Utilities */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const formatCLP = (num) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Math.round(num || 0));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/* Year in footer */
(() => { const y = new Date().getFullYear(); const el = document.getElementById('year'); if (el) el.textContent = y; })();

/* Pricing model for La Araucanía (Temuco) */
const PRICING = {
  baseRate: { // tasa base sobre suma asegurada por ha
    cereales: 0.052,
    frutales: 0.068,
    hortalizas: 0.075,
    forrajeros: 0.048,
  },
  defaultSumPerHa: { // CLP/ha referenciales
    cereales: 1_000_000,
    frutales: 1_800_000,
    hortalizas: 1_200_000,
    forrajeros: 800_000,
  },
  coverageFactor: { // multiplicador por nivel de cobertura
    60: 1.00,
    70: 1.15,
    80: 1.30,
  },
  producerScale: { // descuentos por escala
    small: 1.00,
    medium: 0.95,
    large: 0.90,
  },
  regionRisk: 1.05, // factor Temuco/La Araucanía (lluvias, heladas)
  subsidyByProducer: { // estimado orientativo
    small: 0.40,
    medium: 0.35,
    large: 0.30,
  }
};

/* Quote form behavior */
function updateSumHint() {
  const crop = $('#crop').value;
  const hint = PRICING.defaultSumPerHa[crop];
  $('#sumHint').textContent = `Sugerido: ${formatCLP(hint)} / ha`;
  const input = $('#sumPerHa');
  if (!input.value) input.value = hint;
}

function handleQuoteSubmit(ev) {
  ev.preventDefault();
  const producer = $('#producer').value; // small | medium | large
  const crop = $('#crop').value; // cereales...
  const area = clamp(parseFloat($('#area').value || '0'), 0, 100000);
  const coverage = $('#coverage').value; // 60 | 70 | 80
  const sumPerHa = clamp(parseFloat($('#sumPerHa').value || '0'), 0, 1e9);

  if (!area || !sumPerHa) {
    alert('Ingresa superficie y suma asegurada por ha.');
    return;
  }

  const baseRate = PRICING.baseRate[crop] || 0.05;
  const coverageFactor = PRICING.coverageFactor[coverage] || 1;
  const scale = PRICING.producerScale[producer] || 1;
  const region = PRICING.regionRisk;

  const premiumNet = area * sumPerHa * baseRate * coverageFactor * scale * region;
  const subsidyPct = PRICING.subsidyByProducer[producer] || 0;
  const subsidy = premiumNet * subsidyPct;
  const premiumPayable = Math.max(0, premiumNet - subsidy);

  $('#premiumNet').textContent = formatCLP(premiumNet);
  $('#subsidy').textContent = `− ${formatCLP(subsidy)} (${Math.round(subsidyPct*100)}%)`;
  $('#premiumPayable').textContent = formatCLP(premiumPayable);
  $('#quote-result').hidden = false;
}

function handleQuoteReset() {
  $('#quote-result').hidden = true;
  updateSumHint();
}

/* Initialize quote form */
(() => {
  const form = $('#quote-form');
  if (!form) return;
  updateSumHint();
  $('#crop').addEventListener('change', updateSumHint);
  form.addEventListener('submit', handleQuoteSubmit);
  form.addEventListener('reset', handleQuoteReset);
})();

/* Chatbot IA (retrieval over local knowledge base) */
const KB = [
  {
    q: '¿Qué es NEOAGROTECH?',
    a: 'NEOAGROTECH es una asesoría especializada en seguros agrícolas. Ayudamos a productores de todos los tamaños a proteger su inversión frente a riesgos climáticos, pérdidas de producción y eventos naturales, con respaldo técnico integral.',
    tags: ['acerca', 'empresa', 'quienes', 'asesoría']
  },
  {
    q: 'Servicios de asesoría',
    a: 'Ofrecemos evaluación de riesgos por cultivo y zona, diseño de coberturas y deducibles, gestión y acompañamiento en siniestros, y optimización de subsidios para reducir la prima.',
    tags: ['servicios', 'asesoría', 'ayuda']
  },
  {
    q: 'Coberturas disponibles',
    a: 'Trabajamos coberturas para granizo, heladas, exceso de lluvia, viento, sequía e incendio de origen natural. La disponibilidad puede variar por cultivo y póliza.',
    tags: ['coberturas', 'riesgos', 'granizo', 'heladas']
  },
  {
    q: 'Cómo se calcula la prima',
    a: 'La prima depende de la suma asegurada por ha, el cultivo, la superficie, la cobertura elegida, factores regionales y la escala del productor. Usa el cotizador de la página para una referencia inmediata.',
    tags: ['precio', 'costo', 'prima', 'calcular']
  },
  {
    q: 'Precios referenciales en La Araucanía',
    a: 'Referencias: Cereales 5.2%, Frutales 6.8%, Hortalizas 7.5%, Forrajeros 4.8% sobre la suma asegurada por ha. En Temuco aplicamos un factor regional estimado del 1.05. Los valores son orientativos y pueden variar tras evaluación técnica.',
    tags: ['precios', 'la araucanía', 'temuco', 'tasas']
  },
  {
    q: 'Subsidio estatal',
    a: 'Existen programas que subsidian un porcentaje de la prima. Como referencia, usamos 40% (pequeño), 35% (mediano) y 30% (grande) para estimación. Te ayudamos a postular y confirmar tu porcentaje real.',
    tags: ['subsidio', 'agroseguros', 'apoyo']
  },
  {
    q: 'Contacto',
    a: 'Puedes escribir a leandrozmrn@gmail.com o llamar/WhatsApp al +56 9 78583601. Estamos en Temuco, Av. Alemania.',
    tags: ['contacto', 'email', 'telefono', 'whatsapp', 'ubicación']
  },
  {
    q: 'Asesoría personalizada',
    a: 'Sí, realizamos asesoría personalizada para definir sumas aseguradas, elección de coberturas y deducibles, y acompañamiento en siniestros. Agenda desde el formulario o por WhatsApp.',
    tags: ['asesoría', 'personalizada']
  },
  {
    q: 'Cotizador',
    a: 'En la sección Cotizador puedes ingresar cultivo, superficie, cobertura y suma por ha para calcular una prima referencial con factor regional de Temuco.',
    tags: ['cotizador', 'calcular', 'precio']
  }
];

function normalize(text){
  return (text||'')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñáéíóúü\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarityScore(query, item){
  const q = new Set(normalize(query).split(' '));
  const iStr = normalize(item.q + ' ' + (item.tags||[]).join(' '));
  const i = new Set(iStr.split(' '));
  if (!q.size || !i.size) return 0;
  let inter = 0;
  q.forEach(t => { if (i.has(t)) inter++; });
  const jaccard = inter / (q.size + i.size - inter);
  // Simple containment boost
  const contain = iStr.includes(normalize(query)) ? 0.25 : 0;
  return jaccard + contain;
}

function answerFor(question){
  const scored = KB.map(entry => ({ entry, score: similarityScore(question, entry) }))
    .sort((a,b)=> b.score - a.score);
  const best = scored[0];
  if (best && best.score > 0.05) return best.entry.a;
  // Fallback
  return 'Puedo ayudarte con información de esta página, coberturas, precios referenciales y asesorías. Intenta preguntar por "coberturas", "precios" o "contacto". Si deseas una cotización personalizada, cuéntame cultivo, superficie (ha), cobertura (%) y suma por ha.';
}

/* Chatbot UI */
function pushMessage(role, text){
  const list = $('#chatMessages');
  const item = document.createElement('div');
  item.className = `msg ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  item.appendChild(bubble);
  list.appendChild(item);
  list.scrollTop = list.scrollHeight;
}

function openChat(){ $('#chatbot').hidden = false; $('#chatText').focus(); }
function closeChat(){ $('#chatbot').hidden = true; }

(() => {
  const btn = $('#chatbotToggle');
  const box = $('#chatbot');
  const close = $('#chatbotClose');
  const form = $('#chatForm');
  const input = $('#chatText');

  if (!btn || !box) return;
  btn.addEventListener('click', () => {
    if (box.hidden) { openChat(); pushMessage('bot', 'Hola, soy tu asistente agrícola. ¿En qué te ayudo?'); }
    else closeChat();
  });
  close.addEventListener('click', closeChat);
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    pushMessage('user', q);
    const a = answerFor(q);
    setTimeout(()=> pushMessage('bot', a), 250);
    input.value='';
  });
})();
