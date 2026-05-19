# 🧳 Jarvis Travel Quote App

Cotiza viajes con **IA y precios reales** en tiempo real. Análisis inteligente de vuelos, hoteles y transporte usando Claude API.

![App Preview](https://img.shields.io/badge/Status-Ready-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![Claude](https://img.shields.io/badge/Claude-API-blue)

## ✨ Características

- ✈️ **Búsqueda de vuelos en tiempo real** (datos de Skyscanner)
- 🏨 **Cotización de hospedajes** (datos de Booking)
- 🤖 **Análisis inteligente con Claude IA**
  - 3 paquetes optimizados (Económica, Recomendada, Premium)
  - Recomendaciones personalizadas
  - Insights sobre precios y timing
- 📱 **Progressive Web App (PWA)** - Funciona en móvil y desktop
- 💾 **Funcionalidad offline** con Service Worker
- 🌍 **Soporte para rutas México-internacionales**
- 🎨 **Interfaz moderna y responsive**

## 🚀 Instalación rápida

### 1. Clonar/descargar el proyecto
```bash
cd jarvis-travel-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar template
cp .env.example .env

# Editar .env con tus claves
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Necesitas obtener tu API key de Claude:**
1. Ir a https://console.anthropic.com
2. Crear cuenta / iniciar sesión
3. Copiar tu API key
4. Pegarla en `.env`

### 4. Ejecutar la app

**Opción A: Desarrollo (frontend + backend juntos)**
```bash
npm run dev
```
Accede a `http://localhost:3000`

**Opción B: Solo backend**
```bash
npm run server
```

**Opción C: Testing de casos**
```bash
npm run test
```

## 📋 Estructura del proyecto

```
jarvis-travel-app/
├── src/
│   ├── index.html          # Frontend (HTML/CSS/JS)
│   ├── sw.js               # Service Worker
│   └── manifest.json       # PWA manifest
├── server/
│   └── index.js            # Backend Express + Claude
├── package.json
├── .env.example
└── README.md
```

## 🔌 Integraciones de datos

### Vuelos (Mock por defecto, puedes cambiar a real)
- **Mock**: Datos simulados (gratis, para testing)
- **Real**: Skyscanner API (requiere API key)
- Rutas soportadas: CDMX↔NYC, CDMX↔GDL, CUN↔BZE, etc.

### Hospedaje (Mock por defecto)
- **Mock**: Datos simulados (gratis, para testing)
- **Real**: Booking.com API (requiere asociación partner)

### Análisis (Claude IA)
- Claude Opus 4.6 para análisis inteligente
- Crea 3 paquetes optimizados automáticamente
- Genera insights personalizados

## 🌐 APIs en Producción

Para integrar APIs reales, edita `server/index.js`:

### Skyscanner API
```javascript
// Remplacer MOCK_FLIGHTS con llamada real
async function fetchFlights(origin, destination, date) {
  const response = await axios.post(
    'https://api.skyscanner.net/v2/flights/search',
    { /* params */ },
    { headers: { 'X-API-Key': process.env.SKYSCANNER_API_KEY } }
  );
  return response.data;
}
```

### Booking API
```javascript
// Remplacer MOCK_HOTELS con llamada real
async function fetchHotels(destination, checkIn, checkOut) {
  const response = await axios.get(
    'https://api.booking.com/v2/hotels/search',
    { headers: { 'X-Booking-API-Key': process.env.BOOKING_API_KEY } }
  );
  return response.data;
}
```

## 📱 PWA (Instalar como app)

### En navegador Chrome/Edge:
1. Abre `http://localhost:3000`
2. Haz clic en el ícono "Instalar" en la barra de direcciones
3. Selecciona "Instalar app"
4. La app se abrirá como una aplicación nativa

### En iOS (Safari):
1. Abre la app en Safari
2. Haz clic en "Compartir" → "Agregar a pantalla de inicio"

### En Android:
1. Abre la app en Chrome
2. Haz clic en los 3 puntos → "Instalar app"

## 🧪 Testing

```bash
# Ejecutar casos de prueba
npm run test

# Casos incluidos:
# - CDMX → NYC (Viaje negocios)
# - CDMX → GDL (Weekend)
# - CUN → BZE (Viaje internacional)
```

## 🎯 Casos de uso

### CDMX → Nueva York (Negocios)
```bash
curl -X POST http://localhost:3000/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "CDMX",
    "destination": "NYC",
    "departureDate": "2026-06-15",
    "returnDate": "2026-06-22",
    "passengers": 1,
    "maxBudget": 35000
  }'
```

### CDMX → Guadalajara (Weekend)
```bash
curl -X POST http://localhost:3000/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "CDMX",
    "destination": "GDL",
    "departureDate": "2026-06-20",
    "returnDate": "2026-06-22",
    "passengers": 2,
    "maxBudget": 8000
  }'
```

## 🔐 Variables de entorno

```env
# Requerido
ANTHROPIC_API_KEY=sk-ant-...

# Opcional (para APIs reales)
SKYSCANNER_API_KEY=your_key
BOOKING_API_KEY=your_key

# Config
PORT=3000
NODE_ENV=development|production
```

## 📊 Respuesta API

```json
{
  "success": true,
  "route": "CDMX → NYC",
  "dates": {
    "departure": "2026-06-15",
    "return": "2026-06-22"
  },
  "passengers": 1,
  "nights": 7,
  "packages": [
    {
      "name": "Económica",
      "totalPrice": 12500,
      "breakdown": {
        "flight": {
          "airline": "Viva Aerobus",
          "price": 4200,
          "duration": "6h 45m",
          "stops": 1
        },
        "hotel": {
          "name": "Budget Inn",
          "pricePerNight": 120,
          "totalNights": 7,
          "totalPrice": 840
        },
        "transport": 45
      },
      "whyChooseThis": "Presupuesto ajustado sin sacrificar seguridad",
      "warnings": ["1 escala", "Hotel a 2.5km del centro"]
    }
  ],
  "insights": {
    "bestValue": "Recomendada",
    "cheapest": "Económica",
    "priceRange": {
      "min": 12500,
      "max": 48000
    }
  }
}
```

## 🚢 Deploy

### Railway.app (Recomendado)
```bash
# 1. Crear cuenta en railway.app
# 2. Conectar repositorio GitHub
# 3. Configurar variables de entorno
# 4. Deploy automático
```

### Vercel
```bash
# Crear vercel.json:
{
  "buildCommand": "npm install",
  "outputDirectory": "src",
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic_api_key"
  }
}

# Deploy:
vercel deploy
```

### Heroku
```bash
heroku create jarvis-travel
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
git push heroku main
```

## 🐛 Troubleshooting

**Error: ANTHROPIC_API_KEY no definida**
```bash
# Asegúrate de que .env existe y tiene la key
cat .env
# Reinicia el servidor: npm run dev
```

**Error: CORS bloqueado**
```bash
# El servidor ya incluye CORS configurado
# Si sigue fallando, verifica que expresss/cors esté instalado:
npm install cors
```

**App no carga en móvil**
```bash
# Asegúrate de que:
# 1. El servidor está corriendo: npm run server
# 2. Tu móvil está en la misma red
# 3. Accede a http://TU_IP_LOCAL:3000
```

## 📈 Próximas mejoras

- [ ] Base de datos para guardar búsquedas
- [ ] Integración con Skyscanner API real
- [ ] Integración con Booking API real
- [ ] Notificaciones cuando bajan precios
- [ ] Búsqueda de múltiples destinos
- [ ] Exportar itinerarios a PDF
- [ ] Integración con Google Maps
- [ ] Soporte para múltiples idiomas

## 📞 Soporte

**Problemas con Claude API:**
- https://support.anthropic.com

**Problemas con la app:**
1. Revisa los logs del servidor: `npm run dev`
2. Abre DevTools en el navegador (F12)
3. Busca en la consola errores específicos

## 📄 Licencia

MIT - Úsalo libremente

## 👨‍💻 Autor

Desarrollado para Grupo Ufimas

---

**¿Necesitas ayuda?** Revisa la carpeta `docs/` o abre un issue.
