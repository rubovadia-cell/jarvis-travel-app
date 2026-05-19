#!/usr/bin/env node

# 🚀 JARVIS TRAVEL QUOTE - QUICK START (2 MINUTOS)

## Paso 1: Obtener API Key (1 min)

```
1. Ir a https://console.anthropic.com
2. Sign up / Login
3. Copiar API key (empieza con sk-ant-)
```

## Paso 2: Clonar y configurar (30 seg)

```bash
# Copiar los archivos de jarvis-travel-app a tu máquina

# En la carpeta del proyecto:
cp .env.example .env

# Editar .env y reemplazar:
# ANTHROPIC_API_KEY=sk-ant-...
# con tu clave real
```

## Paso 3: Instalar y ejecutar (30 seg)

```bash
npm install
npm run dev
```

## Paso 4: Abrir en navegador (browser)

```
http://localhost:3000
```

## ✅ ¡LISTO! Comienza a cotizar viajes

Ingresa:
- Origen (ej: CDMX)
- Destino (ej: NYC)
- Fechas
- Pasajeros
- Click en "Buscar Viajes"

---

## 🔧 Troubleshooting rápido

**"ANTHROPIC_API_KEY not defined"**
```bash
# Verifica que .env existe y tiene la clave
cat .env
# Reinicia: npm run dev
```

**"Cannot find module"**
```bash
npm install
```

**"Port 3000 already in use"**
```bash
# Usar puerto diferente
PORT=3001 npm run dev
```

---

## 🌐 Opciones de destinos

Soportados por defecto:
- CDMX ↔ NYC (Nueva York)
- CDMX ↔ GDL (Guadalajara)
- CUN ↔ BZE (Belice)
- CDMX ↔ CUN (Cancún)

Puedes agregar más editando `server/index.js`

---

## 📱 Convertir a PWA (Instalar como app)

Una vez esté corriendo:

**Chrome/Edge:**
1. Haz clic en el ícono de "Instalar" en la barra
2. Selecciona "Instalar app"
3. ¡Abre desde tu pantalla de inicio!

**Safari (iPhone/iPad):**
1. Click en "Compartir"
2. "Agregar a pantalla de inicio"

---

## 🚀 Deploy a producción

Ver archivo `DEPLOY.md` para instrucciones completas.

Opción más fácil: **Railway.app**
```bash
1. Conectar GitHub
2. Railway detecta automáticamente
3. Agregar ANTHROPIC_API_KEY
4. ¡Deploy automático!
```

---

## 📊 Cómo funciona

```
Usuario escribe: CDMX → NYC
         ↓
Servidor obtiene vuelos, hoteles
         ↓
Claude IA analiza datos
         ↓
3 paquetes optimizados
         ↓
Frontend muestra resultados
```

---

## 💡 Próximos pasos

1. ✅ App corriendo en localhost → Probar funcionalidad
2. ✅ Integrar APIs reales → Skyscanner, Booking
3. ✅ Deploy a producción → Railway/Vercel
4. ✅ Agregar base de datos → Guardar búsquedas
5. ✅ Monetizar → Comisiones en bookings

---

## 🎯 Comandos importantes

```bash
npm run dev       # Desarrollo
npm run server    # Solo backend
npm run test      # Test cases
npm run build     # Build producción
```

---

¿Necesitas ayuda?

- README.md → Documentación completa
- ESTRUCTURA.txt → Vista general
- DEPLOY.md → Deployment a producción
- server/index.js → Backend comentado
- src/index.html → Frontend comentado

---

**¡Listo! Disfruta cotizando viajes con IA** ✈️

Cualquier pregunta, revisa los archivos de documentación.
