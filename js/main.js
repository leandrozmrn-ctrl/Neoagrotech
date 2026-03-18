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


