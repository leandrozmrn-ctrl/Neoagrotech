// NeoAgroTech - JavaScript principal

const messages = document.getElementById("chat-messages");
const chatbot = document.getElementById("chatbot");
const chatbotToggle = document.getElementById("chatbot-toggle");

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

function toggleChatbot() {
  chatbot.classList.toggle("active");
  if (chatbot.classList.contains("active")) {
    chatbotToggle.style.display = "none";
    document.getElementById("user-input").focus();

    // Mensaje inicial la primera vez que se abre
    if (messages && messages.children.length === 0) {
      messages.appendChild(
        msg(
          "Hola, soy el asistente de NeoAgroTech. Pregunta sobre seguros de siembra, maquinaria o retorno (5–10%).",
          "bot"
        )
      );
    }
  } else {
    chatbotToggle.style.display = "flex";
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

function msg(text, who = "bot") {
  const d = document.createElement("div");
  d.className = `message ${who}`;
  d.textContent = text;
  return d;
}

function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (text === "") return;

  // Mensaje del usuario
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  messages.appendChild(userMsg);

  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  // Indicador de escritura
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "message bot typing-indicator";
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(typingIndicator);
  messages.scrollTop = messages.scrollHeight;

  // Simular delay de respuesta
  setTimeout(() => {
    typingIndicator.remove();
    
    // Respuesta del bot
    const botMsg = document.createElement("div");
    botMsg.className = "message bot";
    botMsg.textContent = getBotResponse(text);
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  }, 1000);
}

function getBotResponse(input) {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes("hola") || lowerInput.includes("buenos días") || lowerInput.includes("buenas tardes")) {
    return "¡Hola! 👋 Me alegra saludarte. ¿En qué puedo ayudarte? Puedo informarte sobre nuestros seguros de siembra, maquinaria o el retorno de inversión.";
  } else if (lowerInput.includes("siembra") || lowerInput.includes("cultivo")) {
    return "Nuestros seguros de siembra ofrecen cobertura completa contra riesgos climáticos, plagas y pérdidas de producción. Además, garantizamos un retorno de inversión del 5% al 10%. ¿Te gustaría más detalles?";
  } else if (lowerInput.includes("maquinaria") || lowerInput.includes("equipo") || lowerInput.includes("tractor")) {
    return "El seguro de maquinaria protege tus equipos agrícolas frente a daños, accidentes o pérdidas. Cubre tractores, cosechadoras y toda tu maquinaria. ¿Qué tipo de equipo necesitas asegurar?";
  } else if (lowerInput.includes("retorno") || lowerInput.includes("inversión") || lowerInput.includes("beneficio")) {
    return "NeoAgroTech garantiza un retorno de inversión entre el 5% y el 10% sobre lo invertido en siembras o maquinaria agrícola. Es una forma segura de proteger y hacer crecer tu inversión.";
  } else if (lowerInput.includes("precio") || lowerInput.includes("costo") || lowerInput.includes("cotización")) {
    return "Para obtener una cotización personalizada, puedes completar el formulario de contacto en nuestra página o escribirme tus datos y te contactaremos pronto.";
  } else if (lowerInput.includes("contacto") || lowerInput.includes("teléfono") || lowerInput.includes("email")) {
    return "Puedes contactarnos completando el formulario en la sección de contacto. Nuestro equipo se pondrá en contacto contigo a la brevedad.";
  } else if (lowerInput.includes("gracias") || lowerInput.includes("muchas gracias")) {
    return "¡De nada! 😊 Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en consultarme.";
  } else {
    return "Entiendo tu consulta. Puedo ayudarte con información sobre seguros de siembra, maquinaria agrícola, retorno de inversión o cotizaciones. ¿Sobre qué te gustaría saber más?";
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const interesEl = document.getElementById("interes");
  const interes = interesEl ? interesEl.value : "";
  const mensaje = document.getElementById("mensaje").value.trim();

  if (!nombre || !email || !mensaje) return;

  // En hosting estático (GitHub Pages) no podemos guardar en un backend.
  // Lo funcional aquí es abrir el cliente de correo con el mensaje prellenado.
  const to = "contacto@neoagrotech.cl";
  const subject = `Consulta desde NeoAgroTech - ${nombre}`;

  const bodyLines = [
    `Nombre: ${nombre}`,
    `Correo: ${email}`,
    `Teléfono: ${telefono || "-"}`,
    `Interés: ${interes || "-"}`,
    "",
    "Mensaje:",
    mensaje,
    "",
    `URL: ${window.location.href}`,
  ];

  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

  if (formStatus) {
    formStatus.textContent = "Abriendo tu correo para enviar la solicitud...";
    formStatus.style.color = "var(--green-dark)";
  }

  // Abrimos el cliente de correo del usuario
  window.location.href = mailtoUrl;

  // Limpieza (evita resubir accidentalmente al volver atrás)
  if (contactForm) contactForm.reset();
}

// Cerrar chatbot al hacer clic fuera (opcional)
document.addEventListener('click', function(event) {
  if (!chatbot.contains(event.target) && !chatbotToggle.contains(event.target) && chatbot.classList.contains('active')) {
    // No cerrar automáticamente para mejor UX
  }
});

// Enlazar eventos al DOM (para que el formulario funcione en GitHub Pages)
if (contactForm) {
  contactForm.addEventListener("submit", handleFormSubmit);
}

// ============================================================
// Cotizador referencial de seguros (estático, sin backend)
// ============================================================
const valorInput = document.getElementById("valor-asegurado");
const planSelector = document.getElementById("plan-selector");
const cotizarBtn = document.getElementById("cotizar-btn");
const primaResult = document.getElementById("prima-result");
const retornoResult = document.getElementById("retorno-result");
const retornoTrimResult = document.getElementById("retorno-trim-result");

function formatCLP(n) {
  if (!Number.isFinite(n)) return "$—";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

const planConfig = {
  bajo: { primaPctMin: 0.008, primaPctMid: 0.01, primaPctMax: 0.011, retorno: 0.05 },
  medio: { primaPctMin: 0.011, primaPctMid: 0.0135, primaPctMax: 0.014, retorno: 0.07 },
  alto: { primaPctMin: 0.014, primaPctMid: 0.018, primaPctMax: 0.019, retorno: 0.1 },
};

function calcularEstimado() {
  if (!valorInput || !planSelector) return;

  const valor = Number(valorInput.value);
  const plan = planSelector.value;

  if (!valor || valor <= 0 || !planConfig[plan]) {
    if (primaResult) primaResult.textContent = "$—";
    if (retornoResult) retornoResult.textContent = "$—";
    if (retornoTrimResult) retornoTrimResult.textContent = "$—";
    return;
  }

  const cfg = planConfig[plan];

  // Prima anual referencial (estimación usando el valor medio)
  const primaAnual = valor * cfg.primaPctMid;
  const retornoAnual = valor * cfg.retorno;
  const retornoTrimestral = retornoAnual / 4;

  if (primaResult) primaResult.textContent = formatCLP(primaAnual);
  if (retornoResult) retornoResult.textContent = formatCLP(retornoAnual);
  if (retornoTrimResult) retornoTrimResult.textContent = formatCLP(retornoTrimestral);
}

if (cotizarBtn) {
  cotizarBtn.addEventListener("click", calcularEstimado);
}
if (valorInput) {
  valorInput.addEventListener("input", () => {
    // Mantener la UX: no recalcular en cada tecla si hay un botón.
    // Aun así, recalculamos si ya hay resultados.
    calcularEstimado();
  });
}
if (planSelector) {
  planSelector.addEventListener("change", calcularEstimado);
}

// Calcula al cargar si ya existe el cotizador
calcularEstimado();

// ============================================================
// Resaltar pestaña del menú según scroll
// ============================================================
const navLinks = Array.from(document.querySelectorAll("nav a.nav-tab[href^=\"#\"]"));
const navById = {};
navLinks.forEach((a) => {
  const id = a.getAttribute("href").replace("#", "");
  navById[id] = a;
});

const sectionIds = ["inicio", "mision", "seguros", "maquinarias", "neoagrotech", "testimonios", "contacto"];
const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

if (navLinks.length > 0 && sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const id = visible.target.id;
      Object.keys(navById).forEach((k) => navById[k].classList.remove("active"));
      if (navById[id]) navById[id].classList.add("active");
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: [0.12, 0.25, 0.45, 0.65] }
  );

  sections.forEach((s) => observer.observe(s));
}


