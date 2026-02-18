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
    releaseDate: '2024-11-01',
    specs: { chip: 'M4 Pro', color: 'Space Black', storage: '512GB SSD', ram: '18GB', display: '14.2" XDR' },
    prices: {
      apple: { price: 1699, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-pro/14-inch-space-black-apple-m4-pro-chip-14-core-cpu-20-core-gpu-512gb' },
      amazon: { price: 1649, inStock: true, url: 'https://amazon.com/dp/B0DKLHHMZ7' },
      walmart: { price: 1699, inStock: true },
      target: { price: 1699, inStock: false },
      bestbuy: { price: 1649, inStock: true, url: 'https://bestbuy.com/site/apple-macbook-pro-14-laptop-m4-pro-chip-24gb-memory-512gb-ssd-space-black/6534576.p' },
      bh: { price: 1649, inStock: true, url: 'https://bhphotovideo.com/c/product/1801670-REG/apple_mrx33ll_a_14_macbook_pro_with.html' },
      adorama: { price: 1649, inStock: true },
      ebay: { price: 1599, inStock: true },
      cdw: { price: 1699, inStock: true }
    },
    refurbishedPrices: {
      apple: { price: 1449, inStock: true, url: 'https://apple.com/shop/product/MTQM3LL/A' },
      amazon: { price: 1299, inStock: true },
      bestbuy: { price: 1399, inStock: true }
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
    },
    refurbishedPrices: {
      apple: { price: 509, inStock: true },
      amazon: { price: 449, inStock: true },
      bestbuy: { price: 499, inStock: true }
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
  },
  // 2026 Products
  {
    id: 'macbook-pro-14-m5',
    name: 'MacBook Pro 14" M5',
    modelNumber: 'A3400',
    sku: 'MP5X3LL/A',
    category: 'mac',
    specs: { chip: 'M5 Pro', color: 'Space Black', storage: '512GB SSD', ram: '24GB', display: '14.2" XDR ProMotion' },
    prices: {
      apple: { price: 1599, inStock: true },
      amazon: { price: 1549, inStock: true },
      bestbuy: { price: 1549, inStock: true },
      bh: { price: 1529, inStock: true },
      adorama: { price: 1529, inStock: true },
      ebay: { price: 1499, inStock: true }
    },
    refurbishedPrices: {
      apple: { price: 1359, inStock: true },
      amazon: { price: 1199, inStock: true },
      bestbuy: { price: 1319, inStock: true }
    }
  },
  {
    id: 'macbook-air-13-m4',
    name: 'MacBook Air 13" M4',
    modelNumber: 'A3401',
    sku: 'MC5X3LL/A',
    category: 'mac',
    releaseDate: '2025-03-01',
    specs: { chip: 'M4', color: 'Starlight', storage: '256GB SSD', ram: '16GB', display: '13.6" Liquid Retina' },
    prices: {
      apple: { price: 999, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-air/13-inch-starlight-apple-m4-chip-10-core-cpu-10-core-gpu-256gb' },
      amazon: { price: 949, inStock: true, url: 'https://amazon.com/dp/B0DKLHHMZ7' },
      bestbuy: { price: 949, inStock: true, url: 'https://bestbuy.com/site/apple-macbook-air-13-laptop-m4-chip-16gb-memory-256gb-ssd-starlight/6534576.p' },
      bh: { price: 929, inStock: true, url: 'https://bhphotovideo.com/c/product/1801671-REG/apple_mc5x3ll_a_13_macbook_air_with.html' },
      adorama: { price: 929, inStock: true },
      ebay: { price: 899, inStock: true }
    },
    refurbishedPrices: {
      apple: { price: 849, inStock: true },
      amazon: { price: 749, inStock: true },
      bestbuy: { price: 799, inStock: true }
    }
  },
  {
    id: 'ipad-pro-13-m5',
    name: 'iPad Pro 13" M5',
    modelNumber: 'A3500',
    sku: 'IP5PR013M5',
    category: 'ipad',
    specs: { chip: 'M5 Pro', storage: '256GB', display: '13" Tandem OLED', connectivity: 'WiFi' },
    prices: {
      apple: { price: 1099, inStock: true },
      amazon: { price: 1049, inStock: true },
      bestbuy: { price: 1049, inStock: true },
      bh: { price: 1029, inStock: true },
      adorama: { price: 1029, inStock: true },
      ebay: { price: 999, inStock: true }
    }
  },
  {
    id: 'mac-mini-m4',
    name: 'Mac mini M4',
    modelNumber: 'A3010',
    sku: 'MINIM4X3',
    category: 'mac',
    specs: { chip: 'M4 Pro', color: 'Silver', storage: '512GB SSD', ports: 'Thunderbolt 5, HDMI, Ethernet' },
    prices: {
      apple: { price: 599, inStock: true },
      amazon: { price: 579, inStock: true },
      bestbuy: { price: 579, inStock: true },
      bh: { price: 559, inStock: true },
      adorama: { price: 559, inStock: true },
      ebay: { price: 549, inStock: true }
    }
  },
  {
    id: 'apple-watch-series-11',
    name: 'Apple Watch Series 11',
    modelNumber: 'A3100',
    sku: 'WATCH11X3',
    category: 'watch',
    specs: { size: '46mm', case: 'Aluminum', display: 'Always-On Retina', sensors: 'Blood Oxygen, ECG, Temp' },
    prices: {
      apple: { price: 399, inStock: true },
      amazon: { price: 379, inStock: true },
      bestbuy: { price: 379, inStock: true },
      bh: { price: 369, inStock: true },
      adorama: { price: 369, inStock: true },
      ebay: { price: 359, inStock: true }
    }
  },
  {
    id: 'airpods-pro-3',
    name: 'AirPods Pro 3rd Gen',
    modelNumber: 'A3200',
    sku: 'AIRPODS3PRO',
    category: 'airpods',
    specs: { chip: 'H3', anc: true, 'Spatial Audio': true, 'Battery Life': '6h + 30h case' },
    prices: {
      apple: { price: 249, inStock: true },
      amazon: { price: 239, inStock: true },
      bestbuy: { price: 229, inStock: true },
      bh: { price: 229, inStock: true },
      adorama: { price: 219, inStock: true },
      ebay: { price: 209, inStock: true }
    }
  },
  {
    id: 'airpods-4-nc',
    name: 'AirPods 4 with ANC',
    modelNumber: 'A3100',
    sku: 'AIRPODS4ANC',
    category: 'airpods',
    specs: { chip: 'H3', anc: true, 'Spatial Audio': true, 'Battery Life': '5h + 20h case' },
    prices: {
      apple: { price: 179, inStock: true },
      amazon: { price: 169, inStock: true },
      bestbuy: { price: 169, inStock: true },
      bh: { price: 159, inStock: true },
      adorama: { price: 159, inStock: true },
      ebay: { price: 149, inStock: true }
    }
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    modelNumber: 'A3700',
    sku: 'IP17PROX3',
    category: 'iphone',
    specs: { display: '6.3" Super Retina XDR', chip: 'A19 Pro', camera: '48MP Triple', battery: '3500mAh' },
    prices: {
      apple: { price: 999, inStock: true },
      amazon: { price: 979, inStock: true },
      bestbuy: { price: 979, inStock: true },
      bh: { price: 959, inStock: true },
      adorama: { price: 959, inStock: true },
      ebay: { price: 929, inStock: true }
    }
  },
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    modelNumber: 'A3800',
    sku: 'IP17PRMXX3',
    category: 'iphone',
    specs: { display: '6.9" Super Retina XDR', chip: 'A19 Pro', camera: '48MP Triple', battery: '5000mAh' },
    prices: {
      apple: { price: 1199, inStock: true },
      amazon: { price: 1169, inStock: true },
      bestbuy: { price: 1169, inStock: true },
      bh: { price: 1149, inStock: true },
      adorama: { price: 1149, inStock: true },
      ebay: { price: 1099, inStock: true }
    }
  },
  // iPhone 16 Series (Current Gen)
  {
    id: 'iphone-16-pro-max-256',
    name: 'iPhone 16 Pro Max 256GB',
    modelNumber: 'A3084',
    sku: 'MYTM3LL/A',
    category: 'iphone',
    specs: { display: '6.9" Super Retina XDR', chip: 'A18 Pro', storage: '256GB', camera: '48MP Triple', color: 'Natural Titanium' },
    prices: {
      apple: { price: 1199, inStock: true },
      amazon: { price: 1149, inStock: true },
      bestbuy: { price: 1149, inStock: true },
      bh: { price: 1149, inStock: true },
      adorama: { price: 1139, inStock: true },
      ebay: { price: 1099, inStock: true }
    }
  },
  {
    id: 'iphone-16-pro-128',
    name: 'iPhone 16 Pro 128GB',
    modelNumber: 'A3083',
    sku: 'MYMC3LL/A',
    category: 'iphone',
    specs: { display: '6.3" Super Retina XDR', chip: 'A18 Pro', storage: '128GB', camera: '48MP Triple', color: 'Black Titanium' },
    prices: {
      apple: { price: 999, inStock: true },
      amazon: { price: 949, inStock: true },
      bestbuy: { price: 949, inStock: true },
      bh: { price: 949, inStock: true },
      adorama: { price: 939, inStock: true },
      ebay: { price: 899, inStock: true }
    }
  },
  {
    id: 'iphone-16-plus-128',
    name: 'iPhone 16 Plus 128GB',
    modelNumber: 'A3082',
    sku: 'MYAC3LL/A',
    category: 'iphone',
    specs: { display: '6.7" Super Retina XDR', chip: 'A18', storage: '128GB', camera: '48MP Dual', color: 'Ultramarine' },
    prices: {
      apple: { price: 899, inStock: true },
      amazon: { price: 849, inStock: true },
      bestbuy: { price: 849, inStock: true },
      bh: { price: 849, inStock: true },
      adorama: { price: 839, inStock: true },
      ebay: { price: 799, inStock: true }
    }
  },
  {
    id: 'iphone-16-128',
    name: 'iPhone 16 128GB',
    modelNumber: 'A3081',
    sku: 'MYLJ3LL/A',
    category: 'iphone',
    specs: { display: '6.1" Super Retina XDR', chip: 'A18', storage: '128GB', camera: '48MP Dual', color: 'Teal' },
    prices: {
      apple: { price: 799, inStock: true },
      amazon: { price: 749, inStock: true },
      bestbuy: { price: 749, inStock: true },
      bh: { price: 749, inStock: true },
      adorama: { price: 739, inStock: true },
      ebay: { price: 699, inStock: true }
    }
  },
  {
    id: 'iphone-16e-128',
    name: 'iPhone 16e 128GB',
    modelNumber: 'A3212',
    sku: 'MMYE3LL/A',
    category: 'iphone',
    specs: { display: '6.1" Super Retina XDR', chip: 'A18', storage: '128GB', camera: '48MP Single', color: 'Black' },
    prices: {
      apple: { price: 599, inStock: true },
      amazon: { price: 579, inStock: true },
      bestbuy: { price: 579, inStock: true },
      bh: { price: 579, inStock: true },
      adorama: { price: 569, inStock: true },
      ebay: { price: 549, inStock: true }
    }
  },
  // iPad Pro M5 Series (2026)
  {
    id: 'ipad-pro-13-m5-wifi',
    name: 'iPad Pro 13" M5 Wi-Fi',
    modelNumber: 'A3360',
    sku: 'MVX43LL/A',
    category: 'ipad',
    specs: { display: '13" Tandem OLED', chip: 'M5', storage: '256GB', ram: '8GB', connectivity: 'Wi-Fi' },
    prices: {
      apple: { price: 1299, inStock: true },
      amazon: { price: 1249, inStock: true },
      bestbuy: { price: 1249, inStock: true },
      bh: { price: 1249, inStock: true },
      adorama: { price: 1239, inStock: true },
      ebay: { price: 1199, inStock: true }
    }
  },
  {
    id: 'ipad-pro-11-m5-wifi',
    name: 'iPad Pro 11" M5 Wi-Fi',
    modelNumber: 'A3357',
    sku: 'MVV93LL/A',
    category: 'ipad',
    specs: { display: '11" Tandem OLED', chip: 'M5', storage: '256GB', ram: '8GB', connectivity: 'Wi-Fi' },
    prices: {
      apple: { price: 999, inStock: true },
      amazon: { price: 949, inStock: true },
      bestbuy: { price: 949, inStock: true },
      bh: { price: 949, inStock: true },
      adorama: { price: 939, inStock: true },
      ebay: { price: 899, inStock: true }
    }
  },
  {
    id: 'ipad-air-13-m3',
    name: 'iPad Air 13" M3',
    modelNumber: 'A3268',
    sku: 'MV2C3LL/A',
    category: 'ipad',
    specs: { display: '13" Liquid Retina', chip: 'M3', storage: '128GB', ram: '8GB', connectivity: 'Wi-Fi', color: 'Blue' },
    prices: {
      apple: { price: 799, inStock: true },
      amazon: { price: 749, inStock: true },
      bestbuy: { price: 749, inStock: true },
      bh: { price: 749, inStock: true },
      adorama: { price: 739, inStock: true },
      ebay: { price: 699, inStock: true }
    }
  },
  // New Mac products from Apple Store screenshots (Feb 2026)
  {
    id: 'macbook-pro-14-m5',
    name: 'MacBook Pro 14" M5',
    modelNumber: 'A3401',
    sku: 'MHWC3LL/A',
    category: 'mac',
    specs: { chip: 'M5', color: 'Space Black', storage: '512GB SSD', ram: '16GB', display: '14.2" XDR', cpu: '10-core', gpu: '10-core' },
    prices: {
      apple: { price: 1599, inStock: true },
      amazon: { price: 1549, inStock: true },
      bestbuy: { price: 1549, inStock: true },
      bh: { price: 1549, inStock: true },
      adorama: { price: 1539, inStock: true },
      ebay: { price: 1499, inStock: true },
      walmart: { price: 1599, inStock: true },
      target: { price: 1599, inStock: false },
      cdw: { price: 1599, inStock: true }
    }
  },
  {
    id: 'macbook-air-13-m4',
    name: 'MacBook Air 13" M4',
    modelNumber: 'A3402',
    sku: 'MC7V3LL/A',
    category: 'mac',
    specs: { chip: 'M4', color: 'Sky Blue', storage: '256GB SSD', ram: '16GB', display: '13.6" Liquid Retina', colors: 'Sky Blue, Starlight, Silver, Midnight' },
    prices: {
      apple: { price: 999, inStock: true },
      amazon: { price: 949, inStock: true },
      bestbuy: { price: 949, inStock: true },
      bh: { price: 949, inStock: true },
      adorama: { price: 939, inStock: true },
      ebay: { price: 899, inStock: true },
      walmart: { price: 999, inStock: true },
      target: { price: 999, inStock: true },
      cdw: { price: 999, inStock: true }
    }
  },
  {
    id: 'macbook-air-15-m4',
    name: 'MacBook Air 15" M4',
    modelNumber: 'A3403',
    sku: 'MC9F3LL/A',
    category: 'mac',
    specs: { chip: 'M4', color: 'Sky Blue', storage: '256GB SSD', ram: '16GB', display: '15.3" Liquid Retina', colors: 'Sky Blue, Starlight, Silver, Midnight' },
    prices: {
      apple: { price: 1199, inStock: true },
      amazon: { price: 1149, inStock: true },
      bestbuy: { price: 1149, inStock: true },
      bh: { price: 1149, inStock: true },
      adorama: { price: 1139, inStock: true },
      ebay: { price: 1099, inStock: true },
      walmart: { price: 1199, inStock: true },
      target: { price: 1199, inStock: true },
      cdw: { price: 1199, inStock: true }
    }
  },
  {
    id: 'imac-24-m4-2port',
    name: 'iMac 24" M4 (2 Thunderbolt)',
    modelNumber: 'A2875',
    sku: 'MQRC3LL/A',
    category: 'mac',
    specs: { chip: 'M4', color: 'Blue', storage: '256GB SSD', ram: '8GB', display: '24" 4.5K Retina', ports: '2x Thunderbolt', colors: 'Blue, Green, Pink, Silver, Yellow, Orange, Purple' },
    prices: {
      apple: { price: 1299, inStock: true },
      amazon: { price: 1249, inStock: true },
      bestbuy: { price: 1249, inStock: true },
      bh: { price: 1249, inStock: true },
      adorama: { price: 1239, inStock: true },
      ebay: { price: 1199, inStock: true },
      walmart: { price: 1299, inStock: true },
      target: { price: 1299, inStock: true },
      cdw: { price: 1299, inStock: true }
    }
  },
  {
    id: 'imac-24-m4-4port',
    name: 'iMac 24" M4 (4 Thunderbolt)',
    modelNumber: 'A2876',
    sku: 'MQRD3LL/A',
    category: 'mac',
    specs: { chip: 'M4', color: 'Blue', storage: '256GB SSD', ram: '8GB', display: '24" 4.5K Retina', ports: '4x Thunderbolt', colors: 'Blue, Green, Pink, Silver, Yellow, Orange, Purple' },
    prices: {
      apple: { price: 1499, inStock: true },
      amazon: { price: 1449, inStock: true },
      bestbuy: { price: 1449, inStock: true },
      bh: { price: 1449, inStock: true },
      adorama: { price: 1439, inStock: true },
      ebay: { price: 1399, inStock: true },
      walmart: { price: 1499, inStock: true },
      target: { price: 1499, inStock: true },
      cdw: { price: 1499, inStock: true }
    }
  },
  {
    id: 'mac-studio-m4-max',
    name: 'Mac Studio M4 Max',
    modelNumber: 'A3232',
    sku: 'MQGJ3LL/A',
    category: 'mac',
    specs: { chip: 'M4 Max', color: 'Silver', storage: '512GB SSD', ram: '36GB', ports: '6x Thunderbolt', cpu: 'up to 16-core', gpu: 'up to 40-core' },
    prices: {
      apple: { price: 1999, inStock: true },
      amazon: { price: 1949, inStock: true },
      bestbuy: { price: 1949, inStock: true },
      bh: { price: 1949, inStock: true },
      adorama: { price: 1939, inStock: true },
      ebay: { price: 1899, inStock: true },
      walmart: { price: 1999, inStock: false },
      target: { price: 1999, inStock: false },
      cdw: { price: 1999, inStock: true }
    }
  },
  {
    id: 'mac-studio-m3-ultra',
    name: 'Mac Studio M3 Ultra',
    modelNumber: 'A3233',
    sku: 'MQGK3LL/A',
    category: 'mac',
    specs: { chip: 'M3 Ultra', color: 'Silver', storage: '1TB SSD', ram: '64GB', ports: '6x Thunderbolt', cpu: 'up to 32-core', gpu: 'up to 80-core' },
    prices: {
      apple: { price: 3999, inStock: true },
      amazon: { price: 3899, inStock: true },
      bestbuy: { price: 3899, inStock: true },
      bh: { price: 3899, inStock: true },
      adorama: { price: 3889, inStock: true },
      ebay: { price: 3799, inStock: true },
      walmart: { price: 3999, inStock: false },
      target: { price: 3999, inStock: false },
      cdw: { price: 3999, inStock: true }
    }
  },
  // iPhone 17 Series (2026)
  {
    id: 'iphone-17-pro-max-256',
    name: 'iPhone 17 Pro Max 256GB',
    modelNumber: 'A3257',
    sku: 'MYWX3LL/A',
    category: 'iphone',
    specs: { display: '6.9" Super Retina XDR', chip: 'A19 Pro', storage: '256GB', camera: '48MP Triple', colors: 'Silver, Cosmic Orange, Deep Blue' },
    prices: {
      apple: { price: 1199, inStock: true },
      amazon: { price: 1149, inStock: true },
      bestbuy: { price: 1149, inStock: true },
      bh: { price: 1149, inStock: true },
      adorama: { price: 1139, inStock: true },
      ebay: { price: 1099, inStock: true },
      walmart: { price: 1199, inStock: true },
      target: { price: 1199, inStock: true },
      cdw: { price: 1199, inStock: true }
    }
  },
  {
    id: 'iphone-17-pro-256',
    name: 'iPhone 17 Pro 256GB',
    modelNumber: 'A3256',
    sku: 'MYWY3LL/A',
    category: 'iphone',
    specs: { display: '6.3" Super Retina XDR', chip: 'A19 Pro', storage: '256GB', camera: '48MP Triple', colors: 'Silver, Cosmic Orange, Deep Blue' },
    prices: {
      apple: { price: 999, inStock: true },
      amazon: { price: 949, inStock: true },
      bestbuy: { price: 949, inStock: true },
      bh: { price: 949, inStock: true },
      adorama: { price: 939, inStock: true },
      ebay: { price: 899, inStock: true },
      walmart: { price: 999, inStock: true },
      target: { price: 999, inStock: true },
      cdw: { price: 999, inStock: true }
    }
  },
  {
    id: 'iphone-17-air-256',
    name: 'iPhone 17 Air 256GB',
    modelNumber: 'A3255',
    sku: 'MYWZ3LL/A',
    category: 'iphone',
    specs: { display: '6.7" Super Retina XDR', chip: 'A19', storage: '256GB', camera: '48MP Dual', colors: 'Space Black, Cloud White, Light Gold, Sky Blue' },
    prices: {
      apple: { price: 899, inStock: true },
      amazon: { price: 849, inStock: true },
      bestbuy: { price: 849, inStock: true },
      bh: { price: 849, inStock: true },
      adorama: { price: 839, inStock: true },
      ebay: { price: 799, inStock: true },
      walmart: { price: 899, inStock: true },
      target: { price: 899, inStock: true },
      cdw: { price: 899, inStock: true }
    }
  },
  {
    id: 'iphone-17-256',
    name: 'iPhone 17 256GB',
    modelNumber: 'A3255',
    sku: 'MYXA3LL/A',
    category: 'iphone',
    specs: { display: '6.1" Super Retina XDR', chip: 'A19', storage: '256GB', camera: '48MP Dual', colors: 'Black, White, Mist Blue, Sage, Lavender' },
    prices: {
      apple: { price: 799, inStock: true },
      amazon: { price: 749, inStock: true },
      bestbuy: { price: 749, inStock: true },
      bh: { price: 749, inStock: true },
      adorama: { price: 739, inStock: true },
      ebay: { price: 699, inStock: true },
      walmart: { price: 799, inStock: true },
      target: { price: 799, inStock: true },
      cdw: { price: 799, inStock: true }
    }
  },
  // iPhone 16e (Budget)
  {
    id: 'iphone-16e-128',
    name: 'iPhone 16e 128GB',
    modelNumber: 'A3212',
    sku: 'MMYE3LL/A',
    category: 'iphone',
    specs: { display: '6.1" Super Retina XDR', chip: 'A18', storage: '128GB', camera: '48MP Single', colors: 'Black, White' },
    prices: {
      apple: { price: 599, inStock: true },
      amazon: { price: 579, inStock: true },
      bestbuy: { price: 579, inStock: true },
      bh: { price: 579, inStock: true },
      adorama: { price: 569, inStock: true },
      ebay: { price: 549, inStock: true },
      walmart: { price: 599, inStock: true },
      target: { price: 599, inStock: true },
      cdw: { price: 599, inStock: true }
    }
  },
  // iPad Pro M5 Series (2026)
  {
    id: 'ipad-pro-13-m5-cellular',
    name: 'iPad Pro 13" M5 Wi-Fi + Cellular',
    modelNumber: 'A3361',
    sku: 'MVX53LL/A',
    category: 'ipad',
    specs: { display: '13" Tandem OLED', chip: 'M5', storage: '256GB', ram: '8GB', connectivity: 'Wi-Fi + Cellular' },
    prices: {
      apple: { price: 1499, inStock: true },
      amazon: { price: 1449, inStock: true },
      bestbuy: { price: 1449, inStock: true },
      bh: { price: 1449, inStock: true },
      adorama: { price: 1439, inStock: true },
      ebay: { price: 1399, inStock: true },
      walmart: { price: 1499, inStock: true },
      target: { price: 1499, inStock: true },
      cdw: { price: 1499, inStock: true }
    }
  },
  {
    id: 'ipad-pro-11-m5-cellular',
    name: 'iPad Pro 11" M5 Wi-Fi + Cellular',
    modelNumber: 'A3358',
    sku: 'MVVA3LL/A',
    category: 'ipad',
    specs: { display: '11" Tandem OLED', chip: 'M5', storage: '256GB', ram: '8GB', connectivity: 'Wi-Fi + Cellular' },
    prices: {
      apple: { price: 1199, inStock: true },
      amazon: { price: 1149, inStock: true },
      bestbuy: { price: 1149, inStock: true },
      bh: { price: 1149, inStock: true },
      adorama: { price: 1139, inStock: true },
      ebay: { price: 1099, inStock: true },
      walmart: { price: 1199, inStock: true },
      target: { price: 1199, inStock: true },
      cdw: { price: 1199, inStock: true }
    }
  },
  {
    id: 'ipad-air-13-m3-cellular',
    name: 'iPad Air 13" M3 Wi-Fi + Cellular',
    modelNumber: 'A3269',
    sku: 'MV2D3LL/A',
    category: 'ipad',
    specs: { display: '13" Liquid Retina', chip: 'M3', storage: '128GB', ram: '8GB', connectivity: 'Wi-Fi + Cellular', colors: 'Blue, Purple, Space Gray, Starlight' },
    prices: {
      apple: { price: 999, inStock: true },
      amazon: { price: 949, inStock: true },
      bestbuy: { price: 949, inStock: true },
      bh: { price: 949, inStock: true },
      adorama: { price: 939, inStock: true },
      ebay: { price: 899, inStock: true },
      walmart: { price: 999, inStock: true },
      target: { price: 999, inStock: true },
      cdw: { price: 999, inStock: true }
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