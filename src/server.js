import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Minimal test - 3 products only
const products = [
  {
    id: 'iphone-16-128',
    name: 'iPhone 16',
    category: 'iphone',
    specs: { storage: '128GB', color: 'White', chip: 'A18' },
    prices: {
      apple: { price: 799, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-16' },
      amazon: { price: 799, inStock: true, url: 'https://amazon.com/dp/B0DHTYW7P8' },
      bestbuy: { price: 799, inStock: true, url: 'https://bestbuy.com/site/iphone-16' }
    }
  },
  {
    id: 'macbook-air-13-m4',
    name: 'MacBook Air 13"',
    category: 'mac',
    specs: { chip: 'M4', ram: '16GB', storage: '256GB SSD' },
    prices: {
      apple: { price: 999, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-air' },
      amazon: { price: 999, inStock: true, url: 'https://amazon.com/dp/B0DKLHHMZ4' },
      bestbuy: { price: 999, inStock: true, url: 'https://bestbuy.com/site/macbook-air' }
    }
  },
  {
    id: 'ipad-pro-11-m4',
    name: 'iPad Pro 11"',
    category: 'ipad',
    specs: { chip: 'M4', storage: '256GB', display: '11" Ultra Retina XDR' },
    prices: {
      apple: { price: 999, inStock: true, url: 'https://apple.com/shop/buy-ipad/ipad-pro' },
      amazon: { price: 999, inStock: true, url: 'https://amazon.com/dp/B0D3J6D5V8' },
      bestbuy: { price: 999, inStock: true, url: 'https://bestbuy.com/site/ipad-pro' }
    }
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', count: products.length, timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  if (category) {
    return res.json(products.filter(p => p.category === category));
  }
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MacTrackr API - ${products.length} products`);
  console.log(`Running on http://0.0.0.0:${PORT}`);
});