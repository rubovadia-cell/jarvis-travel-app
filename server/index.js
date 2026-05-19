import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("src"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/quote", async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers = 1,
      maxBudget,
      hotelType,
    } = req.body;

    if (!origin || !destination || !departureDate || !returnDate) {
      return res
        .status(400)
        .json({ success: false, error: "Faltan parámetros requeridos" });
    }

    const nights = Math.round(
      (new Date(returnDate) - new Date(departureDate)) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Las fechas no son válidas" });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: `Eres un motor de comparación de precios de viajes experto. Conoces los precios reales del mercado de aerolíneas, hoteles y Airbnb en 2026. Siempre respondes ÚNICAMENTE con JSON válido, sin markdown, sin texto adicional, sin bloques de código.`,
      messages: [
        {
          role: "user",
          content: buildPrompt({
            origin,
            destination,
            departureDate,
            returnDate,
            passengers,
            nights,
            hotelType,
            maxBudget,
          }),
        },
      ],
    });

    const text = message.content[0].text.trim();

    let travelData;
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}") + 1;
      if (start === -1 || end === 0) throw new Error("JSON not found");
      travelData = JSON.parse(text.slice(start, end));
    } catch {
      throw new Error("Error al procesar la respuesta de la IA");
    }

    res.json({
      success: true,
      route: `${origin} → ${destination}`,
      dates: { departure: departureDate, return: returnDate },
      passengers,
      nights,
      ...travelData,
    });
  } catch (error) {
    console.error("API Error:", error);
    res
      .status(500)
      .json({ success: false, error: error.message || "Error interno del servidor" });
  }
});

function buildPrompt({ origin, destination, departureDate, returnDate, passengers, nights, hotelType, maxBudget }) {
  const budgetNote = maxBudget ? `Presupuesto máximo del usuario: $${maxBudget} MXN.` : "";
  const hotelNote = hotelType ? `El usuario prefiere hospedaje tipo: ${hotelType}.` : "";

  return `Analiza todas las opciones de viaje para:

RUTA: ${origin} → ${destination} (ida y vuelta)
FECHAS: ${departureDate} al ${returnDate} (${nights} noches)
PASAJEROS: ${passengers}
${budgetNote}
${hotelNote}

Genera precios REALISTAS en MXN para 2026 considerando:
- Aerolíneas que realmente vuelan esa ruta (directas y con escala)
- Temporada del año para esas fechas
- Diferencia real entre reservar directo con la aerolínea vs OTA vs paquete
- Precios de mercado actuales por tipo de hospedaje y zona

IMPORTANTE: Precios son por persona para vuelos, precio total para ${passengers} pasajero(s).

Responde SOLO con este JSON exacto (sin texto adicional):
{
  "flights": [
    {
      "platform": "Aeromexico Directo",
      "airline": "Aeromexico",
      "price": 18500,
      "stops": 0,
      "duration": "10h 30m",
      "departure_time": "07:15",
      "arrival_time": "17:45",
      "booking_url": "https://aeromexico.com",
      "source_type": "airline_direct",
      "is_cheapest": false,
      "note": "Vuelo directo sin escalas"
    }
  ],
  "accommodations": [
    {
      "platform": "Booking.com",
      "type": "hotel",
      "name": "Nombre real de hotel en ${destination}",
      "stars": 4,
      "neighborhood": "Zona céntrica",
      "price_per_night": 1800,
      "total_price": ${nights * 1800},
      "amenities": ["WiFi", "Desayuno incluido", "Gym"],
      "booking_url": "https://booking.com",
      "rating": 8.4,
      "source_type": "ota",
      "is_cheapest": false,
      "note": "Céntrico, bien valorado"
    }
  ],
  "packages": [
    {
      "platform": "Expedia",
      "description": "Vuelo + Hotel 4* (${nights} noches)",
      "total_price": 32000,
      "total_if_separate": 36000,
      "savings": 4000,
      "savings_pct": 11,
      "includes": ["Vuelo redondo", "Hotel ${nights} noches", "Seguro básico"],
      "booking_url": "https://expedia.com.mx",
      "is_best_package": true,
      "note": "Mejor paquete disponible"
    }
  ],
  "recommendation": {
    "best_strategy": "separate",
    "best_flight_platform": "Nombre plataforma vuelo ganador",
    "best_flight_price": 16000,
    "best_accommodation_platform": "Nombre plataforma hospedaje ganador",
    "best_accommodation_price": 12000,
    "total_best_separate": 28000,
    "best_package_platform": "Nombre del mejor paquete",
    "total_best_package": 32000,
    "saves_vs_package": 4000,
    "verdict": "Párrafo claro explicando cuál es la mejor combinación, exactamente qué plataformas usar y por qué conviene más que el paquete (o viceversa). Menciona el ahorro en pesos.",
    "tips": [
      "Tip específico sobre este destino y ruta",
      "Tip sobre el mejor momento para comprar",
      "Tip sobre el hospedaje en esta ciudad"
    ]
  }
}

Incluye en el JSON:
- flights: 6-8 opciones ordenadas de menor a mayor precio. Incluir: aerolíneas directas, Google Flights estimado, Skyscanner estimado, Despegar, Expedia vuelos. Marca is_cheapest: true en la más barata.
- accommodations: 5-7 opciones ordenadas de menor a mayor precio. Incluir: Booking.com (opción budget), Booking.com (opción estándar), Hotels.com, Airbnb apartamento completo, Airbnb habitación privada. Marca is_cheapest: true en la más barata.
- packages: 3-4 paquetes. Incluir: Expedia, Despegar.com, Booking.com paquete, Viajes el Corte Inglés (si aplica). Marca is_best_package: true en el mejor.
- recommendation: usa best_strategy "separate" o "package" según qué opción sea realmente más barata.`;
}

app.listen(PORT, () => {
  console.log(`Jarvis Travel corriendo en puerto ${PORT}`);
});

export default app;
