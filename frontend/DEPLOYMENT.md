# Black-Cross Frontend - Deployment Guide

## Overview

This guide covers deployment options for the Black-Cross React + TypeScript frontend.

## Prerequisites

- Node.js 16+ and npm 7+
- Backend API running (default: http://localhost:8080)

## Development Deployment

### Local Development Server

```bash
cd client
npm install
npm run dev
```

The development server will start on `http://localhost:3000` with:
- Hot Module Replacement (HMR)
- API proxy to backend (port 8080)
- Source maps for debugging

## Production Deployment

### Build for Production

```bash
cd client
npm run build
```

This creates an optimized production build in `client/dist/` directory containing:
- Minified JavaScript (524 KB, 164 KB gzipped)
- Optimized CSS
- Source maps (for debugging)
- Static assets

### Deployment Options

#### Option 1: Serve with Express (Backend Integration)

Add to your Express backend (`src/index.js`):

```javascript
const path = require('path');

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

#### Option 2: NGINX

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/client/dist;
    index index.html;

    # SPA routing support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Option 3: Docker

**Dockerfile** (in `client/` directory):

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
    }
}
```

Build and run:

```bash
docker build -t black-cross-frontend .
docker run -p 3000:80 black-cross-frontend
```

#### Option 4: Cloud Platforms

**Vercel**:
```bash
npm install -g vercel
cd client
vercel
```

**Netlify**:
```bash
npm install -g netlify-cli
cd client
netlify deploy --prod
```

Configure build settings:
- Build command: `npm run build`
- Publish directory: `dist`
- Redirects: `/* /index.html 200` (for SPA routing)

**AWS S3 + CloudFront**:
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Environment Configuration

### Development (.env)

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Production

Set environment variables before build:

```bash
# Production API URL
export VITE_API_URL=https://api.your-domain.com/api/v1

# Build
npm run build
```

Or use different .env files:
- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.local` - Local overrides (git-ignored)

## Performance Optimization

### Code Splitting

For better load times, implement lazy loading:

```typescript
import { lazy, Suspense } from 'react';

const ThreatList = lazy(() => import('./pages/threats/ThreatList'));

// In routes
<Suspense fallback={<CircularProgress />}>
  <Route path="/threats" element={<ThreatList />} />
</Suspense>
```

### Caching

Configure cache headers in your server:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### CDN

Serve static assets from CDN:

```typescript
// vite.config.ts
export default defineConfig({
  base: 'https://cdn.your-domain.com/',
  // ... other config
});
```

## Monitoring

### Error Tracking

Add Sentry or similar:

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

### Analytics

Add Google Analytics or similar:

```typescript
// Add to index.html or use react-ga
```

## Security

### Content Security Policy

Add to index.html:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### HTTPS

Always use HTTPS in production:
- Use Let's Encrypt for free SSL certificates
- Configure NGINX/Apache for SSL
- Enable HSTS header

## Health Checks

Create a health endpoint:

```typescript
// Add to your server
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});
```

## Rollback Strategy

1. Keep previous build artifacts
2. Use blue-green deployment
3. Implement feature flags
4. Monitor error rates after deployment

## Troubleshooting

### Build Issues

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Runtime Issues

- Check browser console for errors
- Verify API URL configuration
- Check CORS settings on backend
- Verify network connectivity

### Performance Issues

- Run Lighthouse audit
- Check bundle size: `npm run build -- --analyze`
- Optimize images and assets
- Enable compression (gzip/brotli)

## CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd client
          npm ci
      - name: Build
        run: |
          cd client
          npm run build
      - name: Deploy
        run: |
          # Your deployment command
```

## Support

For issues or questions:
- Check [README.md](./README.md)
- Check [FRONTEND_IMPLEMENTATION.md](../FRONTEND_IMPLEMENTATION.md)
- Open a GitHub issue
- Contact: support@black-cross.io
