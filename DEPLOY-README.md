# Quick Deploy to Render

## Option 1: Blueprint (Recommended)
1. Go to https://dashboard.render.com/blueprint
2. Click "New Blueprint Instance"
3. Connect GitHub: drichman1-maker/mactrackr-api
4. Or paste this repo URL: https://github.com/drichman1-maker/mactrackr-api
5. Render will auto-detect render.yaml
6. Click "Deploy"

## Option 2: Manual Web Service
1. https://dashboard.render.com/new/web-service
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Environment Variables:
   - PORT: 10000
   - NODE_ENV: production
   - DATABASE_URL: (create PostgreSQL first)

## Health Check Endpoint
Once deployed, test:
https://mactrackr-backend.onrender.com/api/health

Should return: {"status":"alive","uptime":0,"errors":[]}