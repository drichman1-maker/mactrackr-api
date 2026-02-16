# MacTrackr Backend

Basic Node/Express server for MacTrackr price tracking app.

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
export DATABASE_URL="postgres://..."
export FRONTEND_URL="https://..."

# Start server
npm start
```

## API Endpoints

### GET /api/health
Health check endpoint. Returns server status.

```json
{
  "status": "alive",
  "uptime": 123,
  "errors": []
}
```

### GET /api/prices/:productId
Get price history for a product.

### POST /api/alerts
Create a price alert.

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `FRONTEND_URL`: Frontend app URL for CORS

Optional:
- `PORT`: Server port (default: 3001)

## Deployment

### Render
1. Create web service
2. Connect GitHub repo
3. Add environment variables
4. Deploy

### Database
Using PostgreSQL on Render:
1. Create database
2. Copy connection string
3. Add to env vars

## Scripts

- `npm start`: Start server
- `npm run dev`: Dev mode with nodemon
- `npm test`: Run tests