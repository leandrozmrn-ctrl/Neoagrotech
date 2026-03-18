// NeoAgroTech - JavaScript principal

const messages = document.getElementById("chat-messages");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Mensaje de bienvenida
const welcomeMsg = document.createElement("div");
welcomeMsg.className = "message bot";
welcomeMsg.textContent = "¡Hola! 👋 Soy el asistente de NeoAgroTech. ¿En qué puedo ayudarte hoy?";
messages.appendChild(welcomeMsg);

// Event listeners
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // Mensaje del usuario
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  messages.appendChild(userMsg);

  // Llamada a la API de IA
  getBotResponse(text);

  input.value = "";
  messages.scrollTop = messages.scrollHeight;
}

async function getBotResponse(userText) {
  // Mensaje de "pensando..."
  const botMsg = document.createElement("div");
  botMsg.className = "message bot";
  botMsg.textContent = "Procesando tu consulta...";
  messages.appendChild(botMsg);
  messages.scrollTop = messages.scrollHeight;

  // Verificar si hay API key configurada
  const apiKey = localStorage.getItem('openai_api_key') || 'TU_API_KEY_AQUI';
  
  if (apiKey === 'TU_API_KEY_AQUI' || !apiKey) {
    // Modo fallback sin API
    setTimeout(() => {
      botMsg.textContent = getFallbackResponse(userText);
      messages.scrollTop = messages.scrollHeight;
    }, 500);
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "Eres un asistente de NeoAgroTech que responde sobre seguros agrícolas en Chile. Sé amable, profesional y proporciona información útil sobre seguros de siembra, maquinaria agrícola y retorno de inversión del 5% al 10%." 
          },
          { role: "user", content: userText }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    botMsg.textContent = answer;
    messages.scrollTop = messages.scrollHeight;

  } catch (error) {
    console.error("Error:", error);
    botMsg.textContent = getFallbackResponse(userText);
    messages.scrollTop = messages.scrollHeight;
  }
}

function getFallbackResponse(input) {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes("hola") || lowerInput.includes("buenos días") || lowerInput.includes("buenas")) {
    return "¡Hola! 👋 Me alegra saludarte. ¿En qué puedo ayudarte? Puedo informarte sobre nuestros seguros de siembra, maquinaria o el retorno de inversión.";
  } else if (lowerInput.includes("siembra") || lowerInput.includes("cultivo")) {
    return "Nuestros seguros de siembra ofrecen cobertura completa contra riesgos climáticos, plagas y pérdidas de producción. Además, garantizamos un retorno de inversión del 5% al 10%. ¿Te gustaría más detalles?";
  } else if (lowerInput.includes("maquinaria") || lowerInput.includes("equipo") || lowerInput.includes("tractor")) {
    return "El seguro de maquinaria protege tus equipos agrícolas frente a daños, accidentes o pérdidas. Cubre tractores, cosechadoras y toda tu maquinaria. ¿Qué tipo de equipo necesitas asegurar?";
  } else if (lowerInput.includes("retorno") || lowerInput.includes("inversión") || lowerInput.includes("beneficio")) {
    return "NeoAgroTech garantiza un retorno de inversión entre el 5% y el 10% sobre lo invertido en siembras o maquinaria agrícola. Es una forma segura de proteger y hacer crecer tu inversión.";
  } else if (lowerInput.includes("precio") || lowerInput.includes("costo") || lowerInput.includes("cotización")) {
    return "Para obtener una cotización personalizada, puedes completar el formulario de contacto en nuestra página. Nuestro equipo se pondrá en contacto contigo a la brevedad.";
  } else if (lowerInput.includes("contacto") || lowerInput.includes("teléfono") || lowerInput.includes("email")) {
    return "Puedes contactarnos completando el formulario en la sección de contacto. Nuestro equipo se pondrá en contacto contigo a la brevedad.";
  } else if (lowerInput.includes("gracias")) {
    return "¡De nada! 😊 Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en consultarme.";
  } else {
    return "Entiendo tu consulta. Puedo ayudarte con información sobre seguros de siembra, maquinaria agrícola, retorno de inversión o cotizaciones. ¿Sobre qué te gustaría saber más?";
  }
}

// Formulario de contacto
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  const nombre = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const mensaje = form.querySelector('textarea').value;
  
  status.textContent = "Enviando...";
  status.style.color = "#2e7d32";
  
  // Simular envío (aquí puedes agregar lógica para enviar a un servidor)
  setTimeout(() => {
    status.textContent = `¡Gracias ${nombre}! Tu solicitud ha sido recibida. Te contactaremos pronto en ${email}.`;
    status.style.color = "#2e7d32";
    form.reset();
    
    // Limpiar mensaje después de 5 segundos
    setTimeout(() => {
      status.textContent = "";
    }, 5000);
  }, 1000);
});


