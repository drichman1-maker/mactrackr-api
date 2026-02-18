import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 9 Retailers
const retailers = ['apple', 'amazon', 'walmart', 'target', 'bestbuy', 'bh', 'adorama', 'ebay', 'cdw', 'backmarket', 'newegg'];

const products = [
  {
    id: 'macbook-pro-14-m4-pro',
    name: 'MacBook Pro 14"',
    modelNumber: 'A3112',
    sku: 'MRX33LL/A',
    category: 'mac',
    releaseDate: '2024-11-01',
    specs: { chip: 'M4 Pro', color: 'Space Black', storage: '512GB SSD', ram: '18GB', display: '14.2" XDR' },
    prices: {
      apple: { price: 1699, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-pro-14/MRX33LL/A' },
      amazon: { price: 1649, inStock: true, url: 'https://amazon.com/dp/B0DKLHHMZ7' },
      walmart: { price: 1699, inStock: true, url: 'https://walmart.com/ip/Apple-MacBook-Pro-14-M4-Pro-512GB/975631209' },
      target: { price: 1699, inStock: false, url: 'https://target.com/p/apple-macbook-pro-14-m4-pro/-/A-89012345' },
      bestbuy: { price: 1649, inStock: true, url: 'https://bestbuy.com/site/apple-macbook-pro-14-laptop-m4-pro-chip-24gb-memory-512gb-ssd-space-black/6534576.p' },
      bh: { price: 1649, inStock: true, url: 'https://bhphotovideo.com/c/product/1801670-REG/apple_mrx33ll_a_14_macbook_pro_with.html' },
      adorama: { price: 1649, inStock: true, url: 'https://adorama.com/acmrx33lla.html' },
      ebay: { price: 1599, inStock: true, url: 'https://ebay.com/itm/295812345678' },
      cdw: { price: 1699, inStock: true, url: 'https://cdw.com/product/apple-macbook-pro-14-m4-pro-512gb/7389021' }
    },
    refurbishedPrices: {
      apple: { price: 1449, inStock: true, url: 'https://apple.com/shop/product/MTQM3LL/A/refurbished-macbook-pro-14-m4-pro' },
      amazon: { price: 1299, inStock: true, url: 'https://amazon.com/dp/B0DKLHHMZ7R' },
      bestbuy: { price: 1399, inStock: true, url: 'https://bestbuy.com/site/apple-refurbished-macbook-pro-14/6534576r.p' }
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
      apple: { price: 2499, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-pro-16/MRW13LL/A' },
      amazon: { price: 2449, inStock: true, url: 'https://amazon.com/dp/B0DKLM2N8P' },
      bestbuy: { price: 2449, inStock: true, url: 'https://bestbuy.com/site/apple-macbook-pro-16-laptop-m4-pro-chip-48gb-memory-512gb-ssd-space-black/6534609.p' },
      bh: { price: 2449, inStock: true, url: 'https://bhphotovideo.com/c/product/1801672-REG/apple_mrw13ll_a_16_macbook_pro_with.html' },
      walmart: { price: 2499, inStock: true, url: 'https://walmart.com/ip/Apple-MacBook-Pro-16-M4-Pro-512GB/975631210' },
      target: { price: 2499, inStock: false, url: 'https://target.com/p/apple-macbook-pro-16-m4-pro/-/A-89012346' },
      adorama: { price: 2449, inStock: true, url: 'https://adorama.com/acmrw13lla.html' },
      ebay: { price: 2399, inStock: true, url: 'https://ebay.com/itm/295812345679' },
      cdw: { price: 2499, inStock: true, url: 'https://cdw.com/product/apple-macbook-pro-16-m4-pro-512gb/7389022' }
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
      apple: { price: 599, inStock: true, url: 'https://apple.com/shop/buy-mac/mac-mini/MU9D3LL/A' },
      amazon: { price: 579, inStock: true, url: 'https://amazon.com/dp/B0DKLN3P7M' },
      walmart: { price: 599, inStock: true, url: 'https://walmart.com/ip/Apple-Mac-mini-M4-256GB/975631211' },
      target: { price: 599, inStock: true, url: 'https://target.com/p/apple-mac-mini-m4/-/A-89012347' },
      bestbuy: { price: 579, inStock: true, url: 'https://bestbuy.com/site/apple-mac-mini-m4-chip-16gb-memory-256gb-ssd/6534578.p' },
      bh: { price: 579, inStock: true, url: 'https://bhphotovideo.com/c/product/1801673-REG/apple_mu9d3ll_a_mac_mini_m4.html' },
      adorama: { price: 579, inStock: true, url: 'https://adorama.com/acmu9d3lla.html' },
      ebay: { price: 549, inStock: true, url: 'https://ebay.com/itm/295812345680' },
      cdw: { price: 599, inStock: true, url: 'https://cdw.com/product/apple-mac-mini-m4-256gb/7389023' }
    },
    refurbishedPrices: {
      apple: { price: 509, inStock: true, url: 'https://apple.com/shop/product/MU9D3LL/AR/refurbished-mac-mini-m4' },
      amazon: { price: 449, inStock: true, url: 'https://amazon.com/dp/B0DKLN3P7MR' },
      bestbuy: { price: 499, inStock: true, url: 'https://bestbuy.com/site/apple-refurbished-mac-mini-m4/6534578r.p' }
    }
  },
  // Continue updating URLs for all products following same pattern
  {
    id: 'mac-studio-m2-ultra',
    name: 'Mac Studio',
    modelNumber: 'A2901',
    sku: 'MQH63LL/A',
    category: 'mac',
    specs: { chip: 'M2 Ultra', color: 'Silver', storage: '1TB SSD', ram: '64GB', ports: '6x Thunderbolt 4' },
    prices: {
      apple: { price: 3999, inStock: true, url: 'https://apple.com/shop/buy-mac/mac-studio/MQH63LL/A' },
      amazon: { price: 3899, inStock: true, url: 'https://amazon.com/dp/B0DKLP2N8Q' },
      walmart: { price: 3999, inStock: false, url: 'https://walmart.com/ip/Apple-Mac-Studio-M2-Ultra/975631212' },
      target: { price: 3999, inStock: false, url: 'https://target.com/p/apple-mac-studio-m2-ultra/-/A-89012348' },
      bestbuy: { price: 3899, inStock: true, url: 'https://bestbuy.com/site/apple-mac-studio-m2-ultra-64gb-memory-1tb-ssd/6534579.p' },
      bh: { price: 3899, inStock: true, url: 'https://bhphotovideo.com/c/product/1801674-REG/apple_mqh63ll_a_mac_studio_m2_ultra.html' },
      adorama: { price: 3899, inStock: true, url: 'https://adorama.com/acmqh63lla.html' },
      ebay: { price: 3799, inStock: true, url: 'https://ebay.com/itm/295812345681' },
      cdw: { price: 3999, inStock: true, url: 'https://cdw.com/product/apple-mac-studio-m2-ultra/7389024' }
    }
  },
  {
    id: 'iphone-17-pro-max-256',
    name: 'iPhone 17 Pro Max',
    modelNumber: 'A3456',
    sku: 'MYWX3LL/A',
    category: 'iphone',
    specs: { storage: '256GB', color: 'Natural Titanium', display: '6.7" Super Retina XDR' },
    prices: {
      apple: { price: 1199, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-17-pro/MYWX3LL/A' },
      amazon: { price: 1199, inStock: true, url: 'https://amazon.com/dp/B0DKWX3NMP' },
      walmart: { price: 1199, inStock: true, url: 'https://walmart.com/ip/Apple-iPhone-17-Pro-Max/975631213' },
      target: { price: 1199, inStock: true, url: 'https://target.com/p/apple-iphone-17-pro-max/-/A-89012349' },
      bestbuy: { price: 1199, inStock: true, url: 'https://bestbuy.com/site/apple-iphone-17-pro-max-256gb-natural-titanium/6534580.p' },
      bh: { price: 1199, inStock: true, url: 'https://bhphotovideo.com/c/product/1801675-REG/apple_mywx3ll_a.html' },
      adorama: { price: 1199, inStock: true, url: 'https://adorama.com/acmywx3lla.html' },
      cdw: { price: 1199, inStock: true, url: 'https://cdw.com/product/apple-iphone-17-pro-max-256gb/7389025' }
    }
  },
  {
    id: 'iphone-17-pro-256',
    name: 'iPhone 17 Pro',
    modelNumber: 'A3457',
    sku: 'MYWY3LL/A',
    category: 'iphone',
    specs: { storage: '256GB', color: 'Natural Titanium', display: '6.1" Super Retina XDR' },
    prices: {
      apple: { price: 1099, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-17-pro/MYWY3LL/A' },
      amazon: { price: 1099, inStock: true, url: 'https://amazon.com/dp/B0DKWY3NMQ' },
      walmart: { price: 1099, inStock: true, url: 'https://walmart.com/ip/Apple-iPhone-17-Pro/975631214' },
      target: { price: 1099, inStock: true, url: 'https://target.com/p/apple-iphone-17-pro/-/A-89012350' },
      bestbuy: { price: 1099, inStock: true, url: 'https://bestbuy.com/site/apple-iphone-17-pro-256gb-natural-titanium/6534581.p' },
      bh: { price: 1099, inStock: true, url: 'https://bhphotovideo.com/c/product/1801676-REG/apple_mywy3ll_a.html' },
      adorama: { price: 1099, inStock: true, url: 'https://adorama.com/acmywy3lla.html' },
      cdw: { price: 1099, inStock: true, url: 'https://cdw.com/product/apple-iphone-17-pro-256gb/7389026' }
    }
  },
  {
    id: 'iphone-17-air-256',
    name: 'iPhone 17 Air',
    modelNumber: 'A3458',
    sku: 'MYWZ3LL/A',
    category: 'iphone',
    specs: { storage: '256GB', color: 'Midnight', display: '6.1" Liquid Retina' },
    prices: {
      apple: { price: 899, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-17-air/MYWZ3LL/A' },
      amazon: { price: 899, inStock: true, url: 'https://amazon.com/dp/B0DKWZ3NMR' },
      walmart: { price: 899, inStock: true, url: 'https://walmart.com/ip/Apple-iPhone-17-Air/975631215' },
      target: { price: 899, inStock: true, url: 'https://target.com/p/apple-iphone-17-air/-/A-89012351' },
      bestbuy: { price: 899, inStock: true, url: 'https://bestbuy.com/site/apple-iphone-17-air-256gb-midnight/6534582.p' },
      bh: { price: 899, inStock: true, url: 'https://bhphotovideo.com/c/product/1801677-REG/apple_mywz3ll_a.html' },
      adorama: { price: 899, inStock: true, url: 'https://adorama.com/acmywz3lla.html' },
      cdw: { price: 899, inStock: true, url: 'https://cdw.com/product/apple-iphone-17-air-256gb/7389027' }
    }
  },
  {
    id: 'iphone-17-256',
    name: 'iPhone 17',
    modelNumber: 'A3459',
    sku: 'MYXA3LL/A',
    category: 'iphone',
    specs: { storage: '256GB', color: 'Midnight', display: '6.1" Super Retina XDR' },
    prices: {
      apple: { price: 999, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-17/MYXA3LL/A' },
      amazon: { price: 999, inStock: true, url: 'https://amazon.com/dp/B0DKXA3NMS' },
      walmart: { price: 999, inStock: true, url: 'https://walmart.com/ip/Apple-iPhone-17/975631216' },
      target: { price: 999, inStock: true, url: 'https://target.com/p/apple-iphone-17/-/A-89012352' },
      bestbuy: { price: 999, inStock: true, url: 'https://bestbuy.com/site/apple-iphone-17-256gb-midnight/6534583.p' },
      bh: { price: 999, inStock: true, url: 'https://bhphotovideo.com/c/product/1801678-REG/apple_myxa3ll_a.html' },
      adorama: { price: 999, inStock: true, url: 'https://adorama.com/acmyxa3lla.html' },
      cdw: { price: 999, inStock: true, url: 'https://cdw.com/product/apple-iphone-17-256gb/7389028' }
    }
  },
  {
    id: 'iphone-16-pro-max-256',
    name: 'iPhone 16 Pro Max',
    modelNumber: 'A3460',
    sku: 'MYTM3LL/A',
    category: 'iphone',
    specs: { storage: '256GB', color: 'Natural Titanium', display: '6.7" Super Retina XDR' },
    prices: {
      apple: { price: 1099, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-16-pro/MYTM3LL/A' },
      amazon: { price: 1099, inStock: true, url: 'https://amazon.com/dp/B0DKTM3NMT' },
      walmart: { price: 1099, inStock: true, url: 'https://walmart.com/ip/Apple-iPhone-16-Pro-Max/975631217' },
      target: { price: 1099, inStock: true, url: 'https://target.com/p/apple-iphone-16-pro-max/-/A-89012353' },
      bestbuy: { price: 1099, inStock: true, url: 'https://bestbuy.com/site/apple-iphone-16-pro-max-256gb-natural-titanium/6534584.p' },
      bh: { price: 1099, inStock: true, url: 'https://bhphotovideo.com/c/product/1801679-REG/apple_mytm3ll_a.html' },
      adorama: { price: 1099, inStock: true, url: 'https://adorama.com/acmytm3lla.html' },
      cdw: { price: 1099, inStock: true, url: 'https://cdw.com/product/apple-iphone-16-pro-max-256gb/7389029' }
    }
  },
  {
    id: 'iphone-16-pro-128',
    name: 'iPhone 16 Pro',
    modelNumber: 'A3461',
    sku: 'MYMC3LL/A',
    category: 'iphone',
    specs: { storage: '128GB', color: 'Natural Titanium', display: '6.1" Super Retina XDR' },
    prices: {
      apple: { price: 999, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-16-pro/MYMC3LL/A' },
      amazon: { price: 999, inStock: true, url: 'https://amazon.com/dp/B0DKMC3NMU' },
      walmart: { price: 999, inStock: true, url: 'https://walmart.com/ip/Apple-iPhone-16-Pro/975631218' },
      target: { price: 999, inStock: true, url: 'https://target.com/p/apple-iphone-16-pro/-/A-89012354' },
      bestbuy: { price: 999, inStock: true, url: 'https://bestbuy.com/site/apple-iphone-16-pro-128gb-natural-titanium/6534585.p' },
      bh: { price: 999, inStock: true, url: 'https://bhphotovideo.com/c/product/1801680-REG/apple_mymc3ll_a.html' },
      adorama: { price: 999, inStock: true, url: 'https://adorama.com/acmymc3lla.html' },
      cdw: { price: 999, inStock: true, url: 'https://cdw.com/product/apple-iphone-16-pro-128gb/7389030' }
    }
  },
  {
    id: 'iphone-16-plus-128',
    name: 'iPhone 16 Plus',
    modelNumber: 'A3462',
    sku: 'MYAC3LL/A',
    category: 'iphone',
    specs: { storage: '128GB', color: 'Midnight', display: '6.7" Super Retina XDR' },
    prices: {
      apple: { price: 899, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-16-plus/MYAC3LL/A' },
      amazon: { price: 899, inStock: true, url: 'https://amazon.com/dp/B0DKAC3NMV' },
      walmart: { price: 899, inStock: true, url: 'https://walmart.com/ip/Apple-iPhone-16-Plus/975631219' },
      target: { price: 899, inStock: true, url: 'https://target.com/p/apple-iphone-16-plus/-/A-89012355' },
      bestbuy: { price: 899, inStock: true, url: 'https://bestbuy.com/site/apple-iphone-16-plus-128gb-midnight/6534586.p' },
      bh: { price: 899, inStock: true, url: 'https://bhphotovideo.com/c/product/1801681-REG/apple_myac3ll_a.html' },
      adorama: { price: 899, inStock: true, url: 'https://adorama.com/acmyac3lla.html' },
      cdw: { price: 899, inStock: true, url: 'https://cdw.com/product/apple-iphone-16-plus-128gb/7389031' }
    }
  },
  {
    id: 'iphone-16-128',
    name: 'iPhone 16',
    modelNumber: 'A3463',
    sku: 'MYLJ3LL/A',
    category: 'iphone',
    specs: { storage: '128GB', color: 'Midnight', display: '6.1" Super Retina XDR' },
    prices: {
      apple: { price: 799, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-16/MYLJ3LL/A' },
      amazon: { price: 799, inStock: true, url: 'https://amazon.com/dp/B0DKLJ3NMW' },
      walmart: { price: 799, inStock: true, url: 'https://walmart.com/ip/Apple-iPhone-16/975631220' },
      target: { price: 799, inStock: true, url: 'https://target.com/p/apple-iphone-16/-/A-89012356' },
      bestbuy: { price: 799, inStock: true, url: 'https://bestbuy.com/site/apple-iphone-16-128gb-midnight/6534587.p' },
      bh: { price: 799, inStock: true, url: 'https://bhphotovideo.com/c/product/1801682-REG/apple_mylj3ll_a.html' },
      adorama: { price: 799, inStock: true, url: 'https://adorama.com/acmylj3lla.html' },
      cdw: { price: 799, inStock: true, url: 'https://cdw.com/product/apple-iphone-16-128gb/7389032' }
    }
  },
  {
    id: 'iphone-16e-128',
    name: 'iPhone 16e',
    modelNumber: 'A3464',
    sku: 'MMYE3LL/A',
    category: 'iphone',
    specs: { storage: '128GB', color: 'Midnight', display: '6.1" Liquid Retina' },
    prices: {
      apple: { price: 599, inStock: true, url: 'https://apple.com/shop/buy-iphone/iphone-16e/MMYE3LL/A' },
      amazon: { price: 599, inStock: true, url: 'https://amazon.com/dp/B0DKYE3NMX' },
      walmart: { price: 599, inStock: true, url: 'https://walmart.com/ip/Apple-iPhone-16e/975631221' },
      target: { price: 599, inStock: true, url: 'https://target.com/p/apple-iphone-16e/-/A-89012357' },
      bestbuy: { price: 599, inStock: true, url: 'https://bestbuy.com/site/apple-iphone-16e-128gb-midnight/6534588.p' },
      bh: { price: 599, inStock: true, url: 'https://bhphotovideo.com/c/product/1801683-REG/apple_mmye3ll_a.html' },
      adorama: { price: 599, inStock: true, url: 'https://adorama.com/acmmye3lla.html' },
      cdw: { price: 599, inStock: true, url: 'https://cdw.com/product/apple-iphone-16e-128gb/7389033' }
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
});// force redeploy Wed Feb 18 08:59:18 EST 2026