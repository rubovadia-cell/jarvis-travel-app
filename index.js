import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Instancia de Claude
const anthropic = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// MOCK DATA (En producción: APIs reales)
// ============================================

const MOCK_FLIGHTS = {
  CDMX_NYC: [
    {
      airline: "Aeromexico",
      price: 8500,
      duration: "5h 20m",
      stops: 0,
      rating: 4.2,
      departureTime: "10:30",
      arrivalTime: "16:50",
    },
    {
      airline: "Viva Aerobus",
      price: 4200,
      duration: "6h 45m",
      stops: 1,
      rating: 3.8,
      departureTime: "06:15",
      arrivalTime: "17:00",
    },
    {
      airline: "United",
      price: 9800,
      duration: "4h 50m",
      stops: 0,
      rating: 4.5,
      departureTime: "14:00",
      arrivalTime: "19:50",
    },
  ],
  CDMX_GDL: [
    {
      airline: "Viva Aerobus",
      price: 1200,
      duration: "1h 10m",
      stops: 0,
      rating: 3.9,
      departureTime: "08:00",
      arrivalTime: "09:10",
    },
    {
      airline: "Aeromexico",
      price: 2100,
      duration: "1h 05m",
      stops: 0,
      rating: 4.3,
      departureTime: "17:30",
      arrivalTime: "18:35",
    },
  ],
  CUN_BZE: [
    {
      airline: "Maya Island Air",
      price: 3500,
      duration: "1h 15m",
      stops: 0,
      rating: 4.1,
      departureTime: "08:00",
      arrivalTime: "09:15",
    },
    {
      airline: "Caribbean Airlines",
      price: 4200,
      duration: "2h 30m",
      stops: 1,
      rating: 3.7,
      departureTime: "06:00",
      arrivalTime: "08:30",
    },
  ],
};

const MOCK_HOTELS = {
  NYC: [
    {
      name: "Budget Inn Manhattan",
      price: 120,
      rating: 4.2,
      reviews: 2340,
      distance: "2.5 km del centro",
      amenities: ["WiFi", "Desayuno", "Gym"],
    },
    {
      name: "Standard Hotel Times Square",
      price: 280,
      rating: 4.6,
      reviews: 5120,
      distance: "Centro",
      amenities: ["WiFi", "Restaurante", "Gym", "Piscina"],
    },
    {
      name: "The Plaza Hotel",
      price: 850,
      rating: 4.9,
      reviews: 8900,
      distance: "Centro premium",
      amenities: ["5 estrellas", "Concierge", "Spa"],
    },
  ],
  GDL: [
    {
      name: "Hotel Dena",
      price: 80,
      rating: 4.1,
      reviews: 1200,
      distance: "Centro",
      amenities: ["WiFi", "Gym"],
    },
    {
      name: "Casa Arandina Boutique Hotel",
      price: 200,
      rating: 4.7,
      reviews: 2800,
      distance: "Chapultepec",
      amenities: ["WiFi", "Restaurante", "Spa"],
    },
    {
      name: "The Plaza Guadalajara",
      price: 500,
      rating: 4.8,
      reviews: 4500,
      distance: "Centro premium",
      amenities: ["Lujo", "Concierge", "Restaurante gourmet"],
    },
  ],
  BZE: [
    {
      name: "Belmopan Convention Hotel",
      price: 150,
      rating: 3.9,
      reviews: 600,
      distance: "Centro",
      amenities: ["WiFi", "Restaurante"],
    },
    {
      name: "The Belmopan",
      price: 350,
      rating: 4.5,
      reviews: 1200,
      distance: "Centro premium",
      amenities: ["WiFi", "Restaurante", "Gym", "Pool"],
    },
  ],
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getFlightsByRoute(origin, destination) {
  const key = `${origin}_${destination}`;
  return MOCK_FLIGHTS[key] || MOCK_FLIGHTS.CDMX_NYC;
}

function getHotelsByDestination(destination) {
  return MOCK_HOTELS[destination] || MOCK_HOTELS.NYC;
}

function calculateNights(depDate, retDate) {
  const dep = new Date(depDate);
  const ret = new Date(retDate);
  return Math.ceil((ret - dep) / (1000 * 60 * 60 * 24));
}

// ============================================
// LLAMADA A CLAUDE PARA ANÁLISIS
// ============================================

async function analyzeWithClaude(travelData) {
  const systemPrompt = `Eres experto en cotización de viajes. Analiza datos reales de vuelos, hoteles y transporte.

Crea exactamente 3 paquetes:
1. Económica - presupuesto mínimo
2. Recomendada - mejor relación precio-calidad
3. Premium - máximo confort

RESPONDE SOLO CON JSON VÁLIDO, sin markdown.

Formato:
{
  "packages": [
    {
      "name": "Económica",
      "totalPrice": 12500,
      "breakdown": {
        "flight": {"airline": "X", "price": 4200, "duration": "6h 45m", "stops": 1},
        "hotel": {"name": "Y", "pricePerNight": 120, "totalNights": 7, "totalPrice": 840},
        "transport": 45
      },
      "whyChooseThis": "Presupuesto ajustado",
      "warnings": ["1 escala", "Hotel lejano"]
    }
  ],
  "insights": {
    "bestValue": "Recomendada",
    "cheapest": "Económica",
    "priceRange": {"min": 12500, "max": 48000}
  }
}`;

  const userPrompt = `Cotiza viaje ${travelData.origin} → ${travelData.destination}
Fechas: ${travelData.departureDate} a ${travelData.returnDate}
Pasajeros: ${travelData.passengers}
Presupuesto máx: ${travelData.maxBudget || "Sin límite"} MXN

DATOS REALES:
${JSON.stringify(travelData, null, 2)}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const responseText = message.content[0].text;
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Claude error:", error.message);
    throw error;
  }
}

// ============================================
// RUTAS API
// ============================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Cotizar viaje
app.post("/api/quote", async (req, res) => {
  try {
    const {
      origin = "CDMX",
      destination = "NYC",
      departureDate,
      returnDate,
      passengers = 1,
      maxBudget = null,
      hotelType = "standard",
    } = req.body;

    if (!departureDate || !returnDate) {
      return res.status(400).json({
        error: "Se requieren fechas de ida y vuelta",
      });
    }

    console.log(
      `📡 Cotizando: ${origin} → ${destination} (${passengers} pasajeros)`
    );

    // Obtener datos reales (mocked por ahora)
    const flights = getFlightsByRoute(origin, destination);
    const hotels = getHotelsByDestination(destination);
    const nights = calculateNights(departureDate, returnDate);

    // Preparar datos para Claude
    const travelData = {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      nights,
      maxBudget,
      hotelType,
      flights,
      hotels,
      transport: {
        uber: { estimatedPrice: 45, currency: "MXN" },
        subway: { price: 33, currency: "MXN" },
        rental: { dailyRate: 650, currency: "MXN" },
      },
      fetchedAt: new Date().toISOString(),
    };

    // Enviar a Claude para análisis
    const analysis = await analyzeWithClaude(travelData);

    // Retornar resultado
    res.json({
      success: true,
      route: `${origin} → ${destination}`,
      dates: { departure: departureDate, return: returnDate },
      passengers,
      nights,
      packages: analysis.packages,
      insights: analysis.insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Obtener destinos populares
app.get("/api/destinations", (req, res) => {
  const destinations = [
    { code: "NYC", name: "Nueva York", country: "USA" },
    { code: "GDL", name: "Guadalajara", country: "México" },
    { code: "BZE", name: "Belmopán", country: "Belice" },
    { code: "CUN", name: "Cancún", country: "México" },
    { code: "MAD", name: "Madrid", country: "España" },
    { code: "MIA", name: "Miami", country: "USA" },
    { code: "LAX", name: "Los Ángeles", country: "USA" },
    { code: "ORY", name: "París", country: "Francia" },
  ];
  res.json(destinations);
});

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS
// ============================================

app.use(express.static("src"));

// Fallback a index.html para SPA
app.get("*", (req, res) => {
  res.sendFile(new URL("../src/index.html", import.meta.url).pathname);
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🧳 JARVIS TRAVEL QUOTE APP            ║
║  Servidor running en port ${PORT}      ║
║  http://localhost:${PORT}               ║
╚════════════════════════════════════════╝
  `);
});

export default app;
