import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 9 Retailers
const retailers = ['apple', 'amazon', 'walmart', 'target', 'bestbuy', 'bh', 'adorama', 'ebay', 'cdw'];

const products = [
  {
    id: 'macbook-pro-14-m4-pro',
    name: 'MacBook Pro 14"',
    modelNumber: 'A3112',
    sku: 'MRX33LL/A',
    category: 'mac',
    specs: { chip: 'M4 Pro', color: 'Space Black', storage: '512GB SSD', ram: '18GB', display: '14.2" XDR' },
    prices: {
      apple: { price: 1699, inStock: true },
      amazon: { price: 1649, inStock: true },
      walmart: { price: 1699, inStock: true },
      target: { price: 1699, inStock: false },
      bestbuy: { price: 1649, inStock: true },
      bh: { price: 1649, inStock: true },
      adorama: { price: 1649, inStock: true },
      ebay: { price: 1599, inStock: true },
      cdw: { price: 1699, inStock: true }
    }
  },
  {
    id: 'macbook-pro-16-m4-pro',
    name: 'MacBook Pro 16"',
    modelNumber: 'A3185',
    sku: 'MRW13LL/A',
    category: 'mac',
    specs: { chip: 'M4 Pro', color: 'Space Black', storage: '512GB SSD', ram: '24GB', display: '16.2" XDR' },
    prices: {
      apple: { price: 2499, inStock: true },
      amazon: { price: 2449, inStock: true },
      walmart: { price: 2499, inStock: true },
      target: { price: 2499, inStock: false },
      bestbuy: { price: 2449, inStock: true },
      bh: { price: 2449, inStock: true },
      adorama: { price: 2449, inStock: true },
      ebay: { price: 2399, inStock: true },
      cdw: { price: 2499, inStock: true }
    }
  },
  {
    id: 'macbook-air-13-m3',
    name: 'MacBook Air 13"',
    modelNumber: 'A3113',
    sku: 'MRXV3LL/A',
    category: 'mac',
    specs: { chip: 'M3', color: 'Midnight', storage: '256GB SSD', ram: '8GB', display: '13.6" Retina' },
    prices: {
      apple: { price: 1099, inStock: true },
      amazon: { price: 1049, inStock: true },
      walmart: { price: 1099, inStock: true },
      target: { price: 1099, inStock: true },
      bestbuy: { price: 1049, inStock: true },
      bh: { price: 1049, inStock: true },
      adorama: { price: 1049, inStock: true },
      ebay: { price: 999, inStock: true },
      cdw: { price: 1099, inStock: true }
    }
  },
  {
    id: 'macbook-air-15-m3',
    name: 'MacBook Air 15"',
    modelNumber: 'A3114',
    sku: 'MRYU3LL/A',
    category: 'mac',
    specs: { chip: 'M3', color: 'Starlight', storage: '256GB SSD', ram: '8GB', display: '15.3" Retina' },
    prices: {
      apple: { price: 1299, inStock: true },
      amazon: { price: 1249, inStock: true },
      walmart: { price: 1299, inStock: true },
      target: { price: 1299, inStock: true },
      bestbuy: { price: 1249, inStock: true },
      bh: { price: 1249, inStock: true },
      adorama: { price: 1249, inStock: true },
      ebay: { price: 1199, inStock: true },
      cdw: { price: 1299, inStock: true }
    }
  },
  {
    id: 'mac-mini-m4',
    name: 'Mac mini',
    modelNumber: 'A3232',
    sku: 'MU9D3LL/A',
    category: 'mac',
    specs: { chip: 'M4', color: 'Silver', storage: '256GB SSD', ram: '16GB', ports: '3x Thunderbolt 4' },
    prices: {
      apple: { price: 599, inStock: true },
      amazon: { price: 579, inStock: true },
      walmart: { price: 599, inStock: true },
      target: { price: 599, inStock: true },
      bestbuy: { price: 579, inStock: true },
      bh: { price: 579, inStock: true },
      adorama: { price: 579, inStock: true },
      ebay: { price: 549, inStock: true },
      cdw: { price: 599, inStock: true }
    }
  },
  {
    id: 'mac-studio-m2-ultra',
    name: 'Mac Studio',
    modelNumber: 'A2901',
    sku: 'MQH63LL/A',
    category: 'mac',
    specs: { chip: 'M2 Ultra', color: 'Silver', storage: '1TB SSD', ram: '64GB', ports: '6x Thunderbolt 4' },
    prices: {
      apple: { price: 3999, inStock: true },
      amazon: { price: 3899, inStock: true },
      walmart: { price: 3999, inStock: false },
      target: { price: 3999, inStock: false },
      bestbuy: { price: 3899, inStock: true },
      bh: { price: 3899, inStock: true },
      adorama: { price: 3899, inStock: true },
      ebay: { price: 3799, inStock: true },
      cdw: { price: 3999, inStock: true }
    }
  },
  {
    id: 'imac-24-m3',
    name: 'iMac 24"',
    modelNumber: 'A2875',
    sku: 'MQRJ3LL/A',
    category: 'mac',
    specs: { chip: 'M3', color: 'Blue', storage: '256GB SSD', ram: '8GB', display: '24" 4.5K Retina' },
    prices: {
      apple: { price: 1299, inStock: true },
      amazon: { price: 1249, inStock: true },
      walmart: { price: 1299, inStock: true },
      target: { price: 1299, inStock: true },
      bestbuy: { price: 1249, inStock: true },
      bh: { price: 1249, inStock: true },
      adorama: { price: 1249, inStock: true },
      ebay: { price: 1199, inStock: true },
      cdw: { price: 1299, inStock: true }
    }
  },
  {
    id: 'ipad-pro-11-m4',
    name: 'iPad Pro 11"',
    modelNumber: 'A2836',
    sku: 'MVV83LL/A',
    category: 'ipad',
    specs: { chip: 'M4', color: 'Space Black', storage: '256GB', ram: '8GB', display: '11" Ultra Retina' },
    prices: {
      apple: { price: 999, inStock: true },
      amazon: { price: 949, inStock: true },
      walmart: { price: 999, inStock: true },
      target: { price: 999, inStock: true },
      bestbuy: { price: 949, inStock: true },
      bh: { price: 949, inStock: true },
      adorama: { price: 949, inStock: true },
      ebay: { price: 899, inStock: true },
      cdw: { price: 999, inStock: true }
    }
  },
  {
    id: 'ipad-pro-13-m4',
    name: 'iPad Pro 13"',
    modelNumber: 'A2925',
    sku: 'MVX23LL/A',
    category: 'ipad',
    specs: { chip: 'M4', color: 'Silver', storage: '256GB', ram: '8GB', display: '13" Ultra Retina' },
    prices: {
      apple: { price: 1299, inStock: true },
      amazon: { price: 1249, inStock: true },
      walmart: { price: 1299, inStock: true },
      target: { price: 1299, inStock: true },
      bestbuy: { price: 1249, inStock: true },
      bh: { price: 1249, inStock: true },
      adorama: { price: 1249, inStock: true },
      ebay: { price: 1199, inStock: true },
      cdw: { price: 1299, inStock: true }
    }
  },
  {
    id: 'apple-watch-ultra-2',
    name: 'Apple Watch Ultra 2',
    modelNumber: 'A2986',
    sku: 'MXDJ3LL/A',
    category: 'watch',
    specs: { case: '49mm Titanium', color: 'Natural', connectivity: 'GPS + Cellular', battery: '36 hours' },
    prices: {
      apple: { price: 799, inStock: true },
      amazon: { price: 749, inStock: true },
      walmart: { price: 799, inStock: true },
      target: { price: 799, inStock: true },
      bestbuy: { price: 749, inStock: true },
      bh: { price: 749, inStock: true },
      adorama: { price: 749, inStock: true },
      ebay: { price: 699, inStock: true },
      cdw: { price: 799, inStock: true }
    }
  },
  {
    id: 'apple-watch-series-10',
    name: 'Apple Watch Series 10',
    modelNumber: 'A2998',
    sku: 'MX1J3LL/A',
    category: 'watch',
    specs: { case: '46mm Aluminum', color: 'Jet Black', connectivity: 'GPS', battery: '18 hours' },
    prices: {
      apple: { price: 399, inStock: true },
      amazon: { price: 379, inStock: true },
      walmart: { price: 399, inStock: true },
      target: { price: 399, inStock: true },
      bestbuy: { price: 379, inStock: true },
      bh: { price: 379, inStock: true },
      adorama: { price: 379, inStock: true },
      ebay: { price: 349, inStock: true },
      cdw: { price: 399, inStock: true }
    }
  }
];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'alive', products: products.length, retailers: retailers.length });
});

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let result = products;
  if (category) {
    result = products.filter(p => p.category === category);
  }
  res.json({ products: result, count: result.length });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.get('/api/retailers', (req, res) => {
  res.json({ retailers });
});

app.listen(PORT, () => {
  console.log(`MacTrackr API running on port ${PORT}`);
  console.log(`Products: ${products.length}, Retailers: ${retailers.length}`);
});