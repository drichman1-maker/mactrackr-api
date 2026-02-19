import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Deployed: Feb 19, 2026 - All URLs converted to search format
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to generate search URLs
function generateSearchUrl(retailer, productName, specs) {
  const query = encodeURIComponent(`${productName} ${specs.chip} ${specs.ram} ${specs.storage}`.trim());
  
  const searchUrls = {
    apple: `https://www.apple.com/search?query=${query}`,
    amazon: `https://amazon.com/s?k=${query.replace(/ /g, '+')}`,
    walmart: `https://walmart.com/search?q=${query.replace(/ /g, '+')}`,
    target: `https://target.com/s?searchTerm=${query.replace(/ /g, '+')}`,
    bestbuy: `https://bestbuy.com/site/searchpage.jsp?st=${query.replace(/ /g, '+')}`,
    bh: `https://bhphotovideo.com/c/search?q=${query.replace(/ /g, '%20')}`,
    adorama: `https://www.adorama.com/search?query=${query.replace(/ /g, '%20')}`,
    ebay: `https://www.ebay.com/sch/i.html?_nkw=${query.replace(/ /g, '+')}`,
    cdw: `https://cdw.com/search/?key=${query.replace(/ /g, '%20')}`,
    backmarket: `https://www.backmarket.com/search?q=${query.replace(/ /g, '%20')}`,
    newegg: `https://www.newegg.com/p/pl?d=${query.replace(/ /g, '+')}`
  };
  
  return searchUrls[retailer] || '#';
}

// 11 Retailers
const retailers = ['apple', 'amazon', 'walmart', 'target', 'bestbuy', 'bh', 'adorama', 'ebay', 'cdw', 'backmarket', 'newegg'];

const products = [
  // TEST PRODUCT: iPhone 16 128GB - Direct URLs (Feb 19, 2026)
  {
    id: 'iphone-16-128-unlocked',
    name: 'iPhone 16',
    modelNumber: 'A3287',
    sku: 'MYNF3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-20',
    specs: { storage: '128GB', color: 'White', display: '6.1" Super Retina XDR', camera: '48MP Fusion' },
    prices: {
      apple: { price: 799, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-16' },
      bestbuy: { price: 799, inStock: true, url: 'https://www.bestbuy.com/site/product/apple-iphone-16-128gb-unlocked-white/JJGCQ866TH' },
      walmart: { price: 799, inStock: true, url: 'https://www.walmart.com/ip/iPhone-16-128GB-White-Apple-Intelligence/11469110090' },
      target: { price: 799, inStock: true, url: 'https://www.target.com/p/apple-iphone-16-128gb-white/-/A-86076262' }
    }
  },
  
  {
    id: 'macbook-pro-14-m5',
    name: 'MacBook Pro 14"',
    modelNumber: 'A3113',
    sku: 'MP5X3LL/A',
    category: 'mac',
    releaseDate: '2025-10-01',
    specs: { chip: 'M5', color: 'Space Black', storage: '512GB SSD', ram: '24GB', display: '14.2" XDR' },
    prices: {
      apple: { price: 1999, inStock: true },
      amazon: { price: 1949, inStock: true },
      walmart: { price: 1999, inStock: true },
      target: { price: 1999, inStock: false },
      bestbuy: { price: 1949, inStock: true },
      bh: { price: 1949, inStock: true },
      adorama: { price: 1949, inStock: true },
      ebay: { price: 1899, inStock: true },
      cdw: { price: 1999, inStock: true }
    }
  },
  {
    id: 'macbook-pro-14-m5-1tb',
    name: 'MacBook Pro 14"',
    modelNumber: 'A3113',
    sku: 'MHWC3LL/A',
    category: 'mac',
    releaseDate: '2025-10-01',
    specs: { chip: 'M5', color: 'Space Black', storage: '1TB SSD', ram: '32GB', display: '14.2" XDR' },
    prices: {
      apple: { price: 2399, inStock: true },
      amazon: { price: 2349, inStock: true },
      walmart: { price: 2399, inStock: true },
      target: { price: 2399, inStock: false },
      bestbuy: { price: 2349, inStock: true },
      bh: { price: 2349, inStock: true },
      adorama: { price: 2349, inStock: true },
      ebay: { price: 2299, inStock: true },
      cdw: { price: 2399, inStock: true }
    }
  },
  {
    id: 'macbook-air-13-m4',
    name: 'MacBook Air 13"',
    modelNumber: 'A3115',
    sku: 'MC5X3LL/A',
    category: 'mac',
    releaseDate: '2025-10-01',
    specs: { chip: 'M4', color: 'Space Gray', storage: '256GB SSD', ram: '16GB', display: '13.6" Liquid Retina' },
    prices: {
      apple: { price: 999, inStock: true },
      amazon: { price: 949, inStock: true },
      walmart: { price: 999, inStock: true },
      target: { price: 999, inStock: true },
      bestbuy: { price: 999, inStock: true },
      bh: { price: 899, inStock: true },
      adorama: { price: 999, inStock: true },
      ebay: { price: 949, inStock: true },
      cdw: { price: 999, inStock: true }
    }
  },
  {
    id: 'macbook-air-13-m4-512',
    name: 'MacBook Air 13"',
    modelNumber: 'A3115',
    sku: 'MC7V3LL/A',
    category: 'mac',
    releaseDate: '2025-10-01',
    specs: { chip: 'M4', color: 'Space Gray', storage: '512GB SSD', ram: '16GB', display: '13.6" Liquid Retina' },
    prices: {
      apple: { price: 1199, inStock: true },
      amazon: { price: 1149, inStock: true },
      walmart: { price: 1199, inStock: true },
      target: { price: 1199, inStock: true },
      bestbuy: { price: 1199, inStock: true },
      bh: { price: 1099, inStock: true },
      adorama: { price: 1199, inStock: true },
      ebay: { price: 1149, inStock: true },
      cdw: { price: 1199, inStock: true }
    }
  },
  {
    id: 'macbook-air-15-m4',
    name: 'MacBook Air 15"',
    modelNumber: 'A3116',
    sku: 'MC9F3LL/A',
    category: 'mac',
    releaseDate: '2025-10-01',
    specs: { chip: 'M4', color: 'Space Gray', storage: '512GB SSD', ram: '16GB', display: '15.3" Liquid Retina' },
    prices: {
      apple: { price: 1299, inStock: true },
      amazon: { price: 1249, inStock: true },
      walmart: { price: 1299, inStock: true },
      target: { price: 1299, inStock: true },
      bestbuy: { price: 1299, inStock: true },
      bh: { price: 1199, inStock: true },
      adorama: { price: 1299, inStock: true },
      ebay: { price: 1249, inStock: true },
      cdw: { price: 1299, inStock: true }
    }
  },
  {
    id: 'macbook-pro-14-m4-pro',
    name: 'MacBook Pro 14"',
    modelNumber: 'A3112',
    sku: 'MRX33LL/A',
    category: 'mac',
    releaseDate: '2024-11-01',
    specs: { chip: 'M4 Pro', color: 'Space Black', storage: '512GB SSD', ram: '24GB', display: '14.2" XDR' },
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
    },
    refurbishedPrices: {
      apple: { price: 1449, inStock: true },
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
    releaseDate: '2024-11-01',
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
    id: 'mac-mini-m4',
    name: 'Mac mini',
    modelNumber: 'A3232',
    sku: 'MU9D3LL/A',
    category: 'mac',
    releaseDate: '2024-11-01',
    specs: { chip: 'M4', color: 'Silver', storage: '256GB SSD', ram: '16GB', ports: '3x Thunderbolt 4' },
    prices: {
      apple: { price: 599, inStock: true },
      amazon: { price: 569, inStock: true },
      walmart: { price: 599, inStock: true },
      target: { price: 599, inStock: true },
      bestbuy: { price: 599, inStock: true },
      bh: { price: 569, inStock: true },
      adorama: { price: 569, inStock: true },
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
    releaseDate: '2023-06-01',
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
    id: 'imac-m4',
    name: 'iMac',
    modelNumber: 'A3247',
    sku: 'MQRC3LL/A',
    category: 'mac',
    releaseDate: '2024-11-01',
    specs: { chip: 'M4', color: 'Blue', storage: '256GB SSD', ram: '16GB', display: '24" 4.5K Retina' },
    prices: {
      apple: { price: 1299, inStock: true },
      amazon: { price: 1249, inStock: true },
      walmart: { price: 1299, inStock: true },
      target: { price: 1299, inStock: true },
      bestbuy: { price: 1299, inStock: true },
      bh: { price: 1249, inStock: true },
      adorama: { price: 1249, inStock: true },
      ebay: { price: 1199, inStock: true },
      cdw: { price: 1299, inStock: true }
    }
  },
  {
    id: 'ipad-pro-13-m4',
    name: 'iPad Pro 13"',
    modelNumber: 'A2926',
    sku: 'MVX23LL/A',
    category: 'ipad',
    releaseDate: '2024-05-01',
    specs: { chip: 'M4', color: 'Space Black', storage: '256GB SSD', ram: '8GB', display: '13" Ultra Retina XDR' },
    prices: {
      apple: { price: 1299, inStock: true },
      amazon: { price: 1199, inStock: true },
      walmart: { price: 1299, inStock: true },
      target: { price: 1299, inStock: true },
      bestbuy: { price: 1199, inStock: true },
      bh: { price: 1199, inStock: true },
      adorama: { price: 1199, inStock: true },
      ebay: { price: 1149, inStock: true },
      cdw: { price: 1299, inStock: true }
    },
    refurbishedPrices: {
      apple: { price: 1099, inStock: true },
      amazon: { price: 999, inStock: true },
      bestbuy: { price: 1049, inStock: true }
    }
  },
  {
    id: 'ipad-pro-11-m4',
    name: 'iPad Pro 11"',
    modelNumber: 'A2836',
    sku: 'MVV83LL/A',
    category: 'ipad',
    releaseDate: '2024-05-01',
    specs: { chip: 'M4', color: 'Silver', storage: '256GB SSD', ram: '8GB', display: '11" Ultra Retina XDR' },
    prices: {
      apple: { price: 999, inStock: true },
      amazon: { price: 899, inStock: true },
      walmart: { price: 999, inStock: true },
      target: { price: 999, inStock: true },
      bestbuy: { price: 899, inStock: true },
      bh: { price: 899, inStock: true },
      adorama: { price: 899, inStock: true },
      ebay: { price: 849, inStock: true },
      cdw: { price: 999, inStock: true }
    },
    refurbishedPrices: {
      apple: { price: 849, inStock: true },
      amazon: { price: 749, inStock: true },
      bestbuy: { price: 799, inStock: true }
    }
  },
  {
    id: 'ipad-air-13-m2',
    name: 'iPad Air 13"',
    modelNumber: 'A2898',
    sku: 'MV2D3LL/A',
    category: 'ipad',
    releaseDate: '2024-05-01',
    specs: { chip: 'M2', color: 'Purple', storage: '128GB SSD', ram: '8GB', display: '13" Liquid Retina' },
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
    id: 'ipad-air-11-m3',
    name: 'iPad Air 11"',
    modelNumber: 'A3260',
    sku: 'MUWG3LL/A',
    category: 'ipad',
    releaseDate: '2025-03-01',
    specs: { chip: 'M3', color: 'Starlight', storage: '128GB SSD', ram: '8GB', display: '11" Liquid Retina' },
    prices: {
      apple: { price: 599, inStock: true },
      amazon: { price: 549, inStock: true },
      walmart: { price: 599, inStock: true },
      target: { price: 599, inStock: true },
      bestbuy: { price: 549, inStock: true },
      bh: { price: 549, inStock: true },
      adorama: { price: 549, inStock: true },
      ebay: { price: 499, inStock: true },
      cdw: { price: 599, inStock: true }
    }
  },
  {
    id: 'ipad-11-a16',
    name: 'iPad 11"',
    modelNumber: 'A3314',
    sku: 'MUWA3LL/A',
    category: 'ipad',
    releaseDate: '2025-03-01',
    specs: { chip: 'A16', color: 'Blue', storage: '128GB SSD', ram: '6GB', display: '11" Liquid Retina' },
    prices: {
      apple: { price: 349, inStock: true },
      amazon: { price: 329, inStock: true },
      walmart: { price: 349, inStock: true },
      target: { price: 349, inStock: true },
      bestbuy: { price: 329, inStock: true },
      bh: { price: 329, inStock: true },
      adorama: { price: 329, inStock: true },
      ebay: { price: 299, inStock: true },
      cdw: { price: 349, inStock: true }
    }
  },
  {
    id: 'ipad-mini-7',
    name: 'iPad mini 7',
    modelNumber: 'A3266',
    sku: 'MUXD3LL/A',
    category: 'ipad',
    releaseDate: '2024-10-01',
    specs: { chip: 'A17 Pro', color: 'Blue', storage: '128GB SSD', ram: '8GB', display: '8.3" Liquid Retina' },
    prices: {
      apple: { price: 499, inStock: true },
      amazon: { price: 449, inStock: true },
      walmart: { price: 499, inStock: true },
      target: { price: 499, inStock: true },
      bestbuy: { price: 449, inStock: true },
      bh: { price: 449, inStock: true },
      adorama: { price: 449, inStock: true },
      ebay: { price: 429, inStock: true },
      cdw: { price: 499, inStock: true }
    }
  },
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    modelNumber: 'A3295',
    sku: 'MYTM3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-01',
    specs: { chip: 'A18 Pro', color: 'Natural Titanium', storage: '256GB SSD', ram: '8GB', display: '6.9" Super Retina XDR' },
    prices: {
      apple: { price: 1199, inStock: true },
      amazon: { price: 1149, inStock: true },
      walmart: { price: 1199, inStock: true },
      target: { price: 1199, inStock: true },
      bestbuy: { price: 1149, inStock: true },
      bh: { price: 1149, inStock: true },
      adorama: { price: 1149, inStock: true },
      ebay: { price: 1099, inStock: true },
      cdw: { price: 1199, inStock: true }
    }
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    modelNumber: 'A3293',
    sku: 'MYMC3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-01',
    specs: { chip: 'A18 Pro', color: 'Black Titanium', storage: '128GB SSD', ram: '8GB', display: '6.3" Super Retina XDR' },
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
    id: 'iphone-16',
    name: 'iPhone 16',
    modelNumber: 'A3288',
    sku: 'MYMG3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-01',
    specs: { chip: 'A18', color: 'Ultramarine', storage: '128GB SSD', ram: '8GB', display: '6.1" Super Retina XDR' },
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
    id: 'iphone-16-plus',
    name: 'iPhone 16 Plus',
    modelNumber: 'A3289',
    sku: 'MYPP3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-01',
    specs: { chip: 'A18', color: 'Teal', storage: '128GB SSD', ram: '8GB', display: '6.7" Super Retina XDR' },
    prices: {
      apple: { price: 899, inStock: true },
      amazon: { price: 849, inStock: true },
      walmart: { price: 899, inStock: true },
      target: { price: 899, inStock: true },
      bestbuy: { price: 849, inStock: true },
      bh: { price: 849, inStock: true },
      adorama: { price: 849, inStock: true },
      ebay: { price: 799, inStock: true },
      cdw: { price: 899, inStock: true }
    }
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    modelNumber: 'A3090',
    sku: 'MTML3LL/A',
    category: 'iphone',
    releaseDate: '2023-09-01',
    specs: { chip: 'A16', color: 'Pink', storage: '128GB SSD', ram: '6GB', display: '6.1" Super Retina XDR' },
    prices: {
      apple: { price: 699, inStock: true },
      amazon: { price: 649, inStock: true },
      walmart: { price: 699, inStock: true },
      target: { price: 699, inStock: true },
      bestbuy: { price: 649, inStock: true },
      bh: { price: 649, inStock: true },
      adorama: { price: 649, inStock: true },
      ebay: { price: 599, inStock: true },
      cdw: { price: 699, inStock: true }
    }
  },
  {
    id: 'apple-watch-series-10-46mm',
    name: 'Apple Watch Series 10',
    modelNumber: 'A3300',
    sku: 'MWWG3LL/A',
    category: 'watch',
    releaseDate: '2024-09-01',
    specs: { chip: 'S10', color: 'Jet Black Aluminum', storage: '64GB', ram: '1GB', display: '46mm', caseSize: '46mm' },
    prices: {
      apple: { price: 429, inStock: true },
      amazon: { price: 399, inStock: true },
      walmart: { price: 429, inStock: true },
      target: { price: 429, inStock: true },
      bestbuy: { price: 399, inStock: true },
      bh: { price: 399, inStock: true },
      adorama: { price: 399, inStock: true },
      ebay: { price: 379, inStock: true },
      cdw: { price: 429, inStock: true }
    }
  },
  {
    id: 'apple-watch-series-10-42mm',
    name: 'Apple Watch Series 10',
    modelNumber: 'A3300',
    sku: 'MWW83LL/A',
    category: 'watch',
    releaseDate: '2024-09-01',
    specs: { chip: 'S10', color: 'Rose Gold Aluminum', storage: '64GB', ram: '1GB', display: '42mm', caseSize: '42mm' },
    prices: {
      apple: { price: 399, inStock: true },
      amazon: { price: 369, inStock: true },
      walmart: { price: 399, inStock: true },
      target: { price: 399, inStock: true },
      bestbuy: { price: 369, inStock: true },
      bh: { price: 369, inStock: true },
      adorama: { price: 369, inStock: true },
      ebay: { price: 349, inStock: true },
      cdw: { price: 399, inStock: true }
    }
  },
  {
    id: 'apple-watch-ultra-2',
    name: 'Apple Watch Ultra 2',
    modelNumber: 'A3299',
    sku: 'MRE93LL/A',
    category: 'watch',
    releaseDate: '2024-09-01',
    specs: { chip: 'S9', color: 'Natural Titanium', storage: '64GB', ram: '1GB', display: '49mm', caseSize: '49mm' },
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
    id: 'apple-watch-se-2-44mm',
    name: 'Apple Watch SE 2',
    modelNumber: 'A2722',
    sku: 'MRE33LL/A',
    category: 'watch',
    releaseDate: '2024-09-01',
    specs: { chip: 'S8', color: 'Midnight Aluminum', storage: '32GB', ram: '1GB', display: '44mm', caseSize: '44mm' },
    prices: {
      apple: { price: 279, inStock: true },
      amazon: { price: 249, inStock: true },
      walmart: { price: 279, inStock: true },
      target: { price: 279, inStock: true },
      bestbuy: { price: 249, inStock: true },
      bh: { price: 249, inStock: true },
      adorama: { price: 249, inStock: true },
      ebay: { price: 229, inStock: true },
      cdw: { price: 279, inStock: true }
    }
  },
  {
    id: 'airpods-pro-3',
    name: 'AirPods Pro 3',
    modelNumber: 'A3168',
    sku: 'MW4L3AM/A',
    category: 'airpods',
    releaseDate: '2025-09-01',
    specs: { chip: 'H3', color: 'White', features: 'Active Noise Cancellation, Hearing Aid' },
    prices: {
      apple: { price: 249, inStock: true },
      amazon: { price: 229, inStock: true },
      walmart: { price: 229, inStock: true },
      target: { price: 249, inStock: true },
      bestbuy: { price: 229, inStock: true },
      bh: { price: 229, inStock: true },
      adorama: { price: 229, inStock: true },
      ebay: { price: 219, inStock: true },
      cdw: { price: 249, inStock: true }
    }
  },
  {
    id: 'airpods-4-anc',
    name: 'AirPods 4',
    modelNumber: 'A3212',
    sku: 'MW4P3AM/A',
    category: 'airpods',
    releaseDate: '2024-09-01',
    specs: { chip: 'H2', color: 'White', features: 'Active Noise Cancellation' },
    prices: {
      apple: { price: 179, inStock: true },
      amazon: { price: 149, inStock: true },
      walmart: { price: 149, inStock: true },
      target: { price: 179, inStock: true },
      bestbuy: { price: 149, inStock: true },
      bh: { price: 149, inStock: true },
      adorama: { price: 149, inStock: true },
      ebay: { price: 139, inStock: true },
      cdw: { price: 179, inStock: true }
    }
  },
  {
    id: 'airpods-max-usb-c',
    name: 'AirPods Max',
    modelNumber: 'A3184',
    sku: 'MWY53AM/A',
    category: 'airpods',
    releaseDate: '2024-09-01',
    specs: { chip: 'H1', color: 'Midnight', features: 'USB-C, Spatial Audio' },
    prices: {
      apple: { price: 549, inStock: true },
      amazon: { price: 499, inStock: true },
      walmart: { price: 499, inStock: true },
      target: { price: 549, inStock: true },
      bestbuy: { price: 499, inStock: true },
      bh: { price: 499, inStock: true },
      adorama: { price: 499, inStock: true },
      ebay: { price: 479, inStock: true },
      cdw: { price: 549, inStock: true }
    }
  },
  {
    id: 'apple-tv-4k-3rd-gen',
    name: 'Apple TV 4K',
    modelNumber: 'A2843',
    sku: 'MN893LL/A',
    category: 'appletv',
    releaseDate: '2022-11-01',
    specs: { chip: 'A15', color: 'Black', storage: '128GB', features: 'Wi-Fi + Ethernet' },
    prices: {
      apple: { price: 149, inStock: true },
      amazon: { price: 129, inStock: true },
      walmart: { price: 129, inStock: true },
      target: { price: 149, inStock: true },
      bestbuy: { price: 129, inStock: true },
      bh: { price: 129, inStock: true },
      adorama: { price: 129, inStock: true },
      ebay: { price: 119, inStock: true },
      cdw: { price: 149, inStock: true }
    }
  },
  // NEW PRODUCTS - Feb 19, 2026
  {
    id: 'ipad-air-13-m3',
    name: 'iPad Air 13" M3',
    modelNumber: 'A3240',
    sku: 'MW793LL/A',
    category: 'ipad',
    releaseDate: '2025-03-01',
    specs: { chip: 'M3', color: 'Space Gray', storage: '256GB', display: '13" Liquid Retina' },
    prices: {
      apple: { price: 799, inStock: true },
      amazon: { price: 749, inStock: true },
      walmart: { price: 799, inStock: true },
      target: { price: 799, inStock: true },
      bestbuy: { price: 749, inStock: true },
      bh: { price: 749, inStock: true },
      adorama: { price: 749, inStock: true },
      ebay: { price: 729, inStock: true },
      cdw: { price: 799, inStock: true }
    }
  },
  {
    id: 'ipad-air-11-m3',
    name: 'iPad Air 11" M3',
    modelNumber: 'A3241',
    sku: 'MV793LL/A',
    category: 'ipad',
    releaseDate: '2025-03-01',
    specs: { chip: 'M3', color: 'Space Gray', storage: '256GB', display: '11" Liquid Retina' },
    prices: {
      apple: { price: 599, inStock: true },
      amazon: { price: 549, inStock: true },
      walmart: { price: 599, inStock: true },
      target: { price: 599, inStock: true },
      bestbuy: { price: 549, inStock: true },
      bh: { price: 549, inStock: true },
      adorama: { price: 549, inStock: true },
      ebay: { price: 529, inStock: true },
      cdw: { price: 599, inStock: true }
    }
  },
  {
    id: 'ipad-11-a16',
    name: 'iPad 11" A16',
    modelNumber: 'A3354',
    sku: 'MUWD3LL/A',
    category: 'ipad',
    releaseDate: '2025-03-01',
    specs: { chip: 'A16', color: 'Blue', storage: '128GB', display: '11" Liquid Retina' },
    prices: {
      apple: { price: 499, inStock: true },
      amazon: { price: 449, inStock: true },
      walmart: { price: 499, inStock: true },
      target: { price: 499, inStock: true },
      bestbuy: { price: 449, inStock: true },
      bh: { price: 449, inStock: true },
      adorama: { price: 449, inStock: true },
      ebay: { price: 429, inStock: true },
      cdw: { price: 499, inStock: true }
    }
  },
  {
    id: 'ipad-mini-a17-pro',
    name: 'iPad mini A17 Pro',
    modelNumber: 'A2993',
    sku: 'MU9F3LL/A',
    category: 'ipad',
    releaseDate: '2024-10-01',
    specs: { chip: 'A17 Pro', color: 'Starlight', storage: '256GB', display: '8.3" Liquid Retina' },
    prices: {
      apple: { price: 599, inStock: true },
      amazon: { price: 549, inStock: true },
      walmart: { price: 599, inStock: true },
      target: { price: 599, inStock: true },
      bestbuy: { price: 549, inStock: true },
      bh: { price: 549, inStock: true },
      adorama: { price: 549, inStock: true },
      ebay: { price: 529, inStock: true },
      cdw: { price: 599, inStock: true }
    }
  },
  {
    id: 'apple-watch-se-2-40mm',
    name: 'Apple Watch SE 2',
    modelNumber: 'A2723',
    sku: 'MR933LL/A',
    category: 'watch',
    releaseDate: '2024-09-01',
    specs: { chip: 'S8', color: 'Silver Aluminum', storage: '32GB', display: '40mm', caseSize: '40mm' },
    prices: {
      apple: { price: 249, inStock: true },
      amazon: { price: 219, inStock: true },
      walmart: { price: 249, inStock: true },
      target: { price: 249, inStock: true },
      bestbuy: { price: 219, inStock: true },
      bh: { price: 219, inStock: true },
      adorama: { price: 219, inStock: true },
      ebay: { price: 199, inStock: true },
      cdw: { price: 249, inStock: true }
    }
  },
  {
    id: 'airpods-4-standard',
    name: 'AirPods 4',
    modelNumber: 'A3213',
    sku: 'MW4K3AM/A',
    category: 'airpods',
    releaseDate: '2024-09-01',
    specs: { chip: 'H2', color: 'White', features: 'Spatial Audio' },
    prices: {
      apple: { price: 129, inStock: true },
      amazon: { price: 109, inStock: true },
      walmart: { price: 129, inStock: true },
      target: { price: 129, inStock: true },
      bestbuy: { price: 109, inStock: true },
      bh: { price: 109, inStock: true },
      adorama: { price: 109, inStock: true },
      ebay: { price: 99, inStock: true },
      cdw: { price: 129, inStock: true }
    }
  },
  {
    id: 'homepod-mini',
    name: 'HomePod mini',
    modelNumber: 'A2375',
    sku: 'MY103LL/A',
    category: 'homepod',
    releaseDate: '2020-11-01',
    specs: { chip: 'S5', color: 'Blue', features: 'Spatial Audio, Thread' },
    prices: {
      apple: { price: 99, inStock: true },
      amazon: { price: 79, inStock: true },
      walmart: { price: 99, inStock: true },
      target: { price: 99, inStock: true },
      bestbuy: { price: 79, inStock: true },
      bh: { price: 79, inStock: true },
      adorama: { price: 79, inStock: true },
      ebay: { price: 69, inStock: true },
      cdw: { price: 99, inStock: true }
    }
  },
  {
    id: 'homepod-2nd-gen',
    name: 'HomePod',
    modelNumber: 'A2919',
    sku: 'MQHW3AM/A',
    category: 'homepod',
    releaseDate: '2023-01-01',
    specs: { chip: 'S7', color: 'Midnight', features: 'Spatial Audio, Room Sensing' },
    prices: {
      apple: { price: 299, inStock: true },
      amazon: { price: 249, inStock: true },
      walmart: { price: 299, inStock: true },
      target: { price: 299, inStock: true },
      bestbuy: { price: 249, inStock: true },
      bh: { price: 249, inStock: true },
      adorama: { price: 249, inStock: true },
      ebay: { price: 229, inStock: true },
      cdw: { price: 299, inStock: true }
    }
  },
  {
    id: 'apple-pencil-pro',
    name: 'Apple Pencil Pro',
    modelNumber: 'A2837',
    sku: 'MX2D3AM/A',
    category: 'accessories',
    releaseDate: '2024-05-01',
    specs: { color: 'White', features: 'Haptic Feedback, Find My' },
    prices: {
      apple: { price: 129, inStock: true },
      amazon: { price: 109, inStock: true },
      walmart: { price: 129, inStock: true },
      target: { price: 129, inStock: true },
      bestbuy: { price: 109, inStock: true },
      bh: { price: 109, inStock: true },
      adorama: { price: 109, inStock: true },
      ebay: { price: 99, inStock: true },
      cdw: { price: 129, inStock: true }
    }
  },
  {
    id: 'airtag-4pack',
    name: 'AirTag (4-Pack)',
    modelNumber: 'A2198',
    sku: 'MX544AM/A',
    category: 'accessories',
    releaseDate: '2021-04-01',
    specs: { color: 'Silver', features: 'Precision Finding, Find My Network' },
    prices: {
      apple: { price: 79, inStock: true },
      amazon: { price: 69, inStock: true },
      walmart: { price: 79, inStock: true },
      target: { price: 79, inStock: true },
      bestbuy: { price: 69, inStock: true },
      bh: { price: 69, inStock: true },
      adorama: { price: 69, inStock: true },
      ebay: { price: 59, inStock: true },
      cdw: { price: 79, inStock: true }
    }
  },
  {
    id: 'imac-24-m4',
    name: 'iMac 24" M4',
    modelNumber: 'A3138',
    sku: 'MXCR3LL/A',
    category: 'mac',
    releaseDate: '2024-11-01',
    specs: { chip: 'M4', color: 'Blue', storage: '256GB SSD', ram: '16GB', display: '24" 4.5K Retina' },
    prices: {
      apple: { price: 1299, inStock: true },
      amazon: { price: 1199, inStock: true },
      walmart: { price: 1299, inStock: true },
      target: { price: 1299, inStock: true },
      bestbuy: { price: 1199, inStock: true },
      bh: { price: 1199, inStock: true },
      adorama: { price: 1199, inStock: true },
      ebay: { price: 1149, inStock: true },
      cdw: { price: 1299, inStock: true }
    }
  },
  {
    id: 'mac-studio-m3-max',
    name: 'Mac Studio',
    modelNumber: 'A2901',
    sku: 'MU1J3LL/A',
    category: 'mac',
    releaseDate: '2024-06-01',
    specs: { chip: 'M3 Max', color: 'Silver', storage: '512GB SSD', ram: '36GB', ports: '6x Thunderbolt 4' },
    prices: {
      apple: { price: 2999, inStock: true },
      amazon: { price: 2799, inStock: true },
      walmart: { price: 2999, inStock: true },
      target: { price: 2999, inStock: true },
      bestbuy: { price: 2799, inStock: true },
      bh: { price: 2799, inStock: true },
      adorama: { price: 2799, inStock: true },
      ebay: { price: 2699, inStock: true },
      cdw: { price: 2999, inStock: true }
    }
  },
  {
    id: 'mac-pro-rack',
    name: 'Mac Pro Rack',
    modelNumber: 'A2304',
    sku: 'Z1AF-MAC-PRO-RACK',
    category: 'mac',
    releaseDate: '2023-06-01',
    specs: { chip: 'M2 Ultra', color: 'Stainless Steel', storage: '1TB SSD', ram: '128GB', ports: '8x PCIe' },
    prices: {
      apple: { price: 6499, inStock: true },
      amazon: { price: 5999, inStock: true },
      walmart: { price: 6499, inStock: true },
      target: { price: 6499, inStock: false },
      bestbuy: { price: 5999, inStock: true },
      bh: { price: 5999, inStock: true },
      adorama: { price: 5999, inStock: true },
      ebay: { price: 5799, inStock: true },
      cdw: { price: 6499, inStock: true }
    }
  }
];

// Add dynamic URLs to all products
products.forEach(product => {
  const searchName = `${product.name} ${product.specs.chip} ${product.specs.ram} ${product.specs.storage || product.specs.display || ''}`.trim();
  
  Object.keys(product.prices).forEach(retailer => {
    product.prices[retailer].url = generateSearchUrl(retailer, product.name, product.specs);
  });
  
  if (product.refurbishedPrices) {
    Object.keys(product.refurbishedPrices).forEach(retailer => {
      product.refurbishedPrices[retailer].url = generateSearchUrl(retailer, product.name + ' refurbished', product.specs);
    });
  }
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

app.get('/api/retailers', (req, res) => {
  res.json(retailers);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`MacTrackr API running on port ${PORT}`);
});
