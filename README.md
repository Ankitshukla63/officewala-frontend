# Office Wala Frontend

React + Vite SPA frontend for the "Office Wala" platform, with the authentic Indian truck-art theme, talking to the Office Wala Spring Boot backend.

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run in Development**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`.

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Requirements
- Node.js 18+
- Office Wala Spring Boot backend

## API configuration

Set `VITE_API_BASE_URL` to the backend's public base URL in the Cloudflare Pages build environment. For local development, the app uses port `8080` on the current host. Production builds fall back to the currently configured backend tunnel if the variable is unset.

The current `trycloudflare.com` backend address is a temporary Cloudflare Tunnel URL and can change when its tunnel is restarted. For a stable deployment, use a named Cloudflare Tunnel or another persistent backend URL and update `VITE_API_BASE_URL`.

In Cloudflare Pages, use `npm run build` as the build command and `dist` as the build output directory. Ensure the backend allows the Pages site's origin in `APP_CORS_ALLOWED_ORIGINS`; the backend defaults include Cloudflare Pages domains.
