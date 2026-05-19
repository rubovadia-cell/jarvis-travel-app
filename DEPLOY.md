# 🚀 Deploy a Producción

Instrucciones detalladas para deployar Jarvis Travel Quote en la nube.

## Opción 1: Railway.app (⭐ Recomendado)

**Ventajas**: Más fácil, gratuito con crédito, escalable

### Paso 1: Crear cuenta
1. Ir a https://railway.app
2. Sign up con GitHub / Google
3. Conectar tu cuenta de GitHub

### Paso 2: Crear proyecto
1. Click en "New Project" → "Deploy from GitHub"
2. Seleccionar repositorio (jarvis-travel-app)
3. Railway detecta automáticamente que es Node.js

### Paso 3: Configurar variables
1. En el panel de Railway, ir a "Variables"
2. Agregar:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
NODE_ENV=production
PORT=3000
```

### Paso 4: Deploy automático
```bash
# Git push automáticamente triggerea deploy
git push origin main

# O deployar manualmente desde el panel de Railway
```

**URL en vivo**: `https://jarvis-travel-production.up.railway.app`

---

## Opción 2: Vercel (Para frontend estático)

**Nota**: Vercel es mejor para frontend. Usa Vercel + backend separado en Railway.

### Paso 1: Deploy solo el frontend
```bash
npm install -g vercel
vercel
```

### Paso 2: Configurar API remota
En `src/index.html`, cambiar:
```javascript
const API_BASE = 'https://jarvis-travel-production.up.railway.app';
```

### Paso 3: Deploy
```bash
vercel --prod
```

**URL**: `https://jarvis-travel.vercel.app`

---

## Opción 3: Docker + cualquier plataforma

### Paso 1: Build imagen
```bash
docker build -t jarvis-travel:latest .
```

### Paso 2: Testear localmente
```bash
docker run -e ANTHROPIC_API_KEY=sk-ant-... -p 3000:3000 jarvis-travel:latest
```

### Paso 3: Push a Docker Hub
```bash
docker tag jarvis-travel:latest username/jarvis-travel:latest
docker push username/jarvis-travel:latest
```

### Paso 4: Deploy a platform
- **Google Cloud Run**: `gcloud run deploy jarvis-travel --image username/jarvis-travel`
- **AWS ECS**: Configure task definition y servicio
- **DigitalOcean App Platform**: Conectar GitHub + Docker

---

## Opción 4: Heroku (Legacy, pero aún funciona)

### Paso 1: Instalar Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Descargar desde https://devcenter.heroku.com/articles/heroku-cli
```

### Paso 2: Login y crear app
```bash
heroku login
heroku create jarvis-travel
```

### Paso 3: Configurar variables
```bash
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set NODE_ENV=production
```

### Paso 4: Deploy
```bash
git push heroku main
```

### Ver logs
```bash
heroku logs --tail
```

---

## Opción 5: Tu propio servidor (VPS)

### Paso 1: SSH al servidor
```bash
ssh user@your-ip
```

### Paso 2: Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Paso 3: Clonar proyecto
```bash
git clone https://github.com/your-repo/jarvis-travel-app.git
cd jarvis-travel-app
npm install
```

### Paso 4: Configurar PM2 (process manager)
```bash
sudo npm install -g pm2

# Crear .env con API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# Iniciar app
pm2 start server/index.js --name "jarvis-travel"

# Guardar configuración
pm2 save

# Startup en boot
pm2 startup
```

### Paso 5: Nginx reverse proxy
```bash
sudo apt-get install nginx

# Editar /etc/nginx/sites-available/default
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Testear y restart
sudo nginx -t
sudo systemctl restart nginx
```

### Paso 6: SSL (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Checklist de Pre-Deploy

- [ ] `.env` NO está en Git (verifica .gitignore)
- [ ] Todas las dependencias instaladas: `npm install`
- [ ] Tests locales pasando: `npm run test`
- [ ] API key de Claude válida y configurada
- [ ] Health check funciona: `curl http://localhost:3000/api/health`
- [ ] Frontend carga correctamente
- [ ] APIs mockadas funcionan
- [ ] Service Worker registra correctamente (DevTools → Application)

## Monitoreo Post-Deploy

### Ver logs en tiempo real
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# PM2
pm2 logs jarvis-travel
```

### Healthcheck
```bash
curl https://your-domain.com/api/health
```

### Monitoreo avanzado (Sentry.io)
```javascript
// En server/index.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project",
  environment: "production",
});

app.use(Sentry.Handlers.errorHandler());
```

## Variables de entorno necesarias

```env
# Requerido
ANTHROPIC_API_KEY=sk-ant-...

# Opcional
SKYSCANNER_API_KEY=...
BOOKING_API_KEY=...

# Config
PORT=3000
NODE_ENV=production
```

## Cost estimado (mensual)

| Plataforma | Costo | Notes |
|-----------|-------|-------|
| Railway | $5-20 | Crédito gratuito disponible |
| Vercel | Free | Frontend solamente |
| Heroku | $7-25 | Requires credit card |
| Google Cloud Run | $0.15-0.5 | Pay per request |
| DigitalOcean | $4-12 | Basic droplet |
| AWS | Var | Tier gratuito disponible |

## Troubleshooting

### Error: ANTHROPIC_API_KEY not defined
```bash
# Verificar variable está configurada
railway env  # Si usas Railway
heroku config  # Si usas Heroku

# O redefinir
railway variables add ANTHROPIC_API_KEY sk-ant-...
```

### Error: Cannot find module
```bash
npm install --production
# Luego redeploy
```

### App cuelga en startup
```bash
# Ver logs completos
railway logs --follow
# O en consola local:
NODE_ENV=production node server/index.js
```

### Database connection error (si agrega DB)
```bash
# Verificar connection string
echo $DATABASE_URL

# O resetear
railway restart
```

---

## Domain personalizado

### En Railway
1. Panel → Deployment → Networking
2. Add Custom Domain
3. Apuntar DNS CNAME a tu dominio

### En Vercel
1. Settings → Domains
2. Add Domain
3. Seguir instrucciones DNS

### En Heroku
```bash
heroku domains:add your-domain.com
# Agregar CNAME DNS record
```

---

¡Listo! Tu app está en vivo 🎉

Para ver estado: https://status.your-domain.com/api/health
