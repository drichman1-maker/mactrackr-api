import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  initPriceHistoryTable, 
  recordPrice, 
  getPriceHistory, 
  getRetailerPriceHistory,
  getLatestPrices,
  getPriceDrops,
  getInventoryChanges,
  cleanupOldData
} from './db.js';

dotenv.config();

// Deployed: Feb 20, 2026 3:10 PM EST - Added affiliate link tracking
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ==========================================
// AFFILIATE CONFIGURATION
// ==========================================
const AFFILIATE_IDS = {
  amazon: process.env.AMAZON_ASSOCIATES_TAG || null,
  apple: process.env.APPLE_AFFILIATE_ID || null,
  bestbuy: process.env.BESTBUY_AFFILIATE_ID || null,
  bh: process.env.BH_AFFILIATE_ID || null,
  adorama: process.env.ADORAMA_AFFILIATE_ID || null,
  ebay: process.env.EBAY_CAMPAIGN_ID || null
};

// Build affiliate URL for each retailer
function buildAffiliateUrl(retailer, baseUrl) {
  if (!baseUrl || baseUrl === '#') return baseUrl;
  
  const affiliateId = AFFILIATE_IDS[retailer];
  if (!affiliateId) return baseUrl;
  
  switch(retailer) {
    case 'amazon':
      return baseUrl.includes('?') 
        ? `${baseUrl}&tag=${affiliateId}`
        : `${baseUrl}?tag=${affiliateId}`;
    
    case 'apple':
      return `https://apple.sjv.io/c/${affiliateId}?u=${encodeURIComponent(baseUrl)}`;
    
    case 'bestbuy':
      return baseUrl.includes('?')
        ? `${baseUrl}&ref=${affiliateId}`
        : `${baseUrl}?ref=${affiliateId}`;
    
    case 'bh':
      return baseUrl.includes('?')
        ? `${baseUrl}&kw=${affiliateId}`
        : `${baseUrl}?kw=${affiliateId}`;
    
    case 'adorama':
      return baseUrl.includes('?')
        ? `${baseUrl}&aff=${affiliateId}`
        : `${baseUrl}?aff=${affiliateId}`;
    
    case 'ebay':
      return `https://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=${affiliateId}&toolid=10001&customid=&mpre=${encodeURIComponent(baseUrl)}`;
    
    default:
      return baseUrl;
  }
}

// Add affiliate URLs to product data
function enrichProductWithAffiliateUrls(product) {
  const enrichedPrices = {};
  
  for (const [retailer, data] of Object.entries(product.prices)) {
    enrichedPrices[retailer] = {
      ...data,
      affiliateUrl: buildAffiliateUrl(retailer, data.url)
    };
  }
  
  const enrichedRefurbished = {};
  if (product.refurbishedPrices) {
    for (const [retailer, data] of Object.entries(product.refurbishedPrices)) {
      enrichedRefurbished[retailer] = {
        ...data,
        affiliateUrl: buildAffiliateUrl(retailer, data.url)
      };
    }
  }
  
  return {
    ...product,
    prices: enrichedPrices,
    ...(product.refurbishedPrices && { refurbishedPrices: enrichedRefurbished })
  };
}

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
  },
  // === POPULAR PRODUCTS FROM PDF (Feb 20, 2026) ===
  // iPhone 16 Pro Max variants
  {
    id: 'iphone-16-pro-max-256',
    name: 'iPhone 16 Pro Max',
    modelNumber: 'A3084',
    sku: 'MYW63LL/A',
    category: 'iphone',
    releaseDate: '2024-09-20',
    specs: { storage: '256GB', color: 'Natural Titanium', display: '6.9" Super Retina XDR', chip: 'A18 Pro' },
    prices: {
      apple: { price: 1199, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-16-pro-max' },
      amazon: { price: 1199, inStock: true, url: 'https://www.amazon.com/dp/B0DHTZ4QQP' },
      bestbuy: { price: 1199, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-16-pro-max-256gb-natural-titanium-verizon/MYW63LL-A' },
      walmart: { price: 1199, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-16-Pro-Max-256GB-Natural-Titanium/5000354046' },
      target: { price: 1199, inStock: true, url: 'https://www.target.com/p/apple-iphone-16-pro-max/-/A-93597962' },
      bh: { price: 1199, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800549-REG/apple_mynn3ll_a_iphone_16_pro_max.html' },
      adorama: { price: 1199, inStock: true, url: 'https://www.adorama.com/ac25616pmaxnt.html' }
    }
  },
  {
    id: 'iphone-16-pro-max-512',
    name: 'iPhone 16 Pro Max',
    modelNumber: 'A3084',
    sku: 'MYWE3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-20',
    specs: { storage: '512GB', color: 'Natural Titanium', display: '6.9" Super Retina XDR', chip: 'A18 Pro' },
    prices: {
      apple: { price: 1399, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-16-pro-max' },
      amazon: { price: 1399, inStock: true, url: 'https://www.amazon.com/dp/B0DHTZCKW7' },
      bestbuy: { price: 1399, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-16-pro-max-512gb-natural-titanium-verizon/MYWE3LL-A' },
      walmart: { price: 1399, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-16-Pro-Max-512GB-Natural-Titanium/5000354047' },
      target: { price: 1399, inStock: true, url: 'https://www.target.com/p/apple-iphone-16-pro-max/-/A-93597963' },
      bh: { price: 1399, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800551-REG/apple_myx53ll_a_iphone_16_pro_max.html' },
      adorama: { price: 1399, inStock: true, url: 'https://www.adorama.com/ac51216pmaxnt.html' }
    }
  },
  {
    id: 'iphone-16-pro-max-1tb',
    name: 'iPhone 16 Pro Max',
    modelNumber: 'A3084',
    sku: 'MYWJ3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-20',
    specs: { storage: '1TB', color: 'Natural Titanium', display: '6.9" Super Retina XDR', chip: 'A18 Pro' },
    prices: {
      apple: { price: 1599, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-16-pro-max' },
      amazon: { price: 1599, inStock: true, url: 'https://www.amazon.com/dp/B0DHTZP38' },
      bestbuy: { price: 1599, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-16-pro-max-1tb-natural-titanium-verizon/MYWJ3LL-A' },
      walmart: { price: 1599, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-16-Pro-Max-1TB-Natural-Titanium/5000354048' },
      bh: { price: 1599, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800553-REG/apple_myxa3ll_a_iphone_16_pro_max.html' },
      adorama: { price: 1599, inStock: true, url: 'https://www.adorama.com/ac1tb16pmaxnt.html' }
    }
  },
  // iPhone 16 Pro variants
  {
    id: 'iphone-16-pro-256',
    name: 'iPhone 16 Pro',
    modelNumber: 'A3083',
    sku: 'MYMG3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-20',
    specs: { storage: '256GB', color: 'Natural Titanium', display: '6.3" Super Retina XDR', chip: 'A18 Pro' },
    prices: {
      apple: { price: 1099, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-16-pro' },
      amazon: { price: 1099, inStock: true, url: 'https://www.amazon.com/dp/B0DHTYH7Z7' },
      bestbuy: { price: 1099, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-16-pro-256gb-natural-titanium-verizon/MYMG3LL-A' },
      walmart: { price: 1099, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-16-Pro-256GB-Natural-Titanium/5000354036' },
      target: { price: 1099, inStock: true, url: 'https://www.target.com/p/apple-iphone-16-pro/-/A-93597960' },
      bh: { price: 1099, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800545-REG/apple_myu93ll_a_iphone_16_pro.html' },
      adorama: { price: 1099, inStock: true, url: 'https://www.adorama.com/ac25616pnt.html' }
    }
  },
  {
    id: 'iphone-16-pro-512',
    name: 'iPhone 16 Pro',
    modelNumber: 'A3083',
    sku: 'MYMK3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-20',
    specs: { storage: '512GB', color: 'Natural Titanium', display: '6.3" Super Retina XDR', chip: 'A18 Pro' },
    prices: {
      apple: { price: 1299, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-16-pro' },
      amazon: { price: 1299, inStock: true, url: 'https://www.amazon.com/dp/B0DHTZ25P' },
      bestbuy: { price: 1299, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-16-pro-512gb-natural-titanium-verizon/MYMK3LL-A' },
      walmart: { price: 1299, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-16-Pro-512GB-Natural-Titanium/5000354037' },
      bh: { price: 1299, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800547-REG/apple_myvc3ll_a_iphone_16_pro.html' },
      adorama: { price: 1299, inStock: true, url: 'https://www.adorama.com/ac51216pnt.html' }
    }
  },
  // iPhone 16 and 16 Plus
  {
    id: 'iphone-16-128',
    name: 'iPhone 16',
    modelNumber: 'A3081',
    sku: 'MYAP3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-20',
    specs: { storage: '128GB', color: 'Ultramarine', display: '6.1" Super Retina XDR', chip: 'A18' },
    prices: {
      apple: { price: 799, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-16' },
      amazon: { price: 799, inStock: true, url: 'https://www.amazon.com/dp/B0DHTYW7P8' },
      bestbuy: { price: 799, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-16-128gb-ultramarine-verizon/MYAP3LL-A' },
      walmart: { price: 799, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-16-128GB-Ultramarine/5000354024' },
      target: { price: 799, inStock: true, url: 'https://www.target.com/p/apple-iphone-16/-/A-93597958' },
      bh: { price: 799, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800534-REG/apple_myd53ll_a_iphone_16_128gb.html' },
      adorama: { price: 799, inStock: true, url: 'https://www.adorama.com/ac12816um.html' }
    }
  },
  {
    id: 'iphone-16-plus-128',
    name: 'iPhone 16 Plus',
    modelNumber: 'A3082',
    sku: 'MXUT3LL/A',
    category: 'iphone',
    releaseDate: '2024-09-20',
    specs: { storage: '128GB', color: 'Teal', display: '6.7" Super Retina XDR', chip: 'A18' },
    prices: {
      apple: { price: 899, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-16' },
      amazon: { price: 899, inStock: true, url: 'https://www.amazon.com/dp/B0DHTZ5XW' },
      bestbuy: { price: 899, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-16-plus-128gb-teal-verizon/MXUT3LL-A' },
      walmart: { price: 899, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-16-Plus-128GB-Teal/5000354030' },
      target: { price: 899, inStock: true, url: 'https://www.target.com/p/apple-iphone-16-plus/-/A-93597959' },
      bh: { price: 899, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800538-REG/apple_mydu3ll_a_iphone_16_plus.html' },
      adorama: { price: 899, inStock: true, url: 'https://www.adorama.com/ac12816pt.html' }
    }
  },
  // iPhone 15 series
  {
    id: 'iphone-15-pro-max-256',
    name: 'iPhone 15 Pro Max',
    modelNumber: 'A2849',
    sku: 'MU663LL/A',
    category: 'iphone',
    releaseDate: '2023-09-22',
    specs: { storage: '256GB', color: 'Natural Titanium', display: '6.7" Super Retina XDR', chip: 'A17 Pro' },
    prices: {
      apple: { price: 1199, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-15-pro' },
      amazon: { price: 1099, inStock: true, url: 'https://www.amazon.com/dp/B0CHX1W1XY' },
      bestbuy: { price: 1099, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-15-pro-max-256gb-natural-titanium-verizon/MU663LL-A' },
      walmart: { price: 1099, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-15-Pro-Max-256GB-Natural-Titanium/5063901321' },
      bh: { price: 1099, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1782600-REG/apple_mu663ll_a_iphone_15_pro_max.html' },
      adorama: { price: 1099, inStock: true, url: 'https://www.adorama.com/ac25615pmaxnt.html' }
    }
  },
  {
    id: 'iphone-15-pro-256',
    name: 'iPhone 15 Pro',
    modelNumber: 'A2848',
    sku: 'MU6A3LL/A',
    category: 'iphone',
    releaseDate: '2023-09-22',
    specs: { storage: '256GB', color: 'Natural Titanium', display: '6.1" Super Retina XDR', chip: 'A17 Pro' },
    prices: {
      apple: { price: 1099, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-15-pro' },
      amazon: { price: 999, inStock: true, url: 'https://www.amazon.com/dp/B0CHX4F374' },
      bestbuy: { price: 999, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-15-pro-256gb-natural-titanium-verizon/MU6A3LL-A' },
      walmart: { price: 999, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-15-Pro-256GB-Natural-Titanium/5063901318' },
      bh: { price: 999, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1782594-REG/apple_mu6a3ll_a_iphone_15_pro_256gb.html' },
      adorama: { price: 999, inStock: true, url: 'https://www.adorama.com/ac25615pnt.html' }
    }
  },
  {
    id: 'iphone-15-128',
    name: 'iPhone 15',
    modelNumber: 'A2846',
    sku: 'MTPN3LL/A',
    category: 'iphone',
    releaseDate: '2023-09-22',
    specs: { storage: '128GB', color: 'Pink', display: '6.1" Super Retina XDR', chip: 'A16' },
    prices: {
      apple: { price: 699, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-15' },
      amazon: { price: 699, inStock: true, url: 'https://www.amazon.com/dp/B0CHX2F9QT' },
      bestbuy: { price: 699, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-15-128gb-pink-verizon/MTPN3LL-A' },
      walmart: { price: 699, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-15-128GB-Pink/5063901307' },
      target: { price: 699, inStock: true, url: 'https://www.target.com/p/apple-iphone-15/-/A-89345370' },
      bh: { price: 699, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1782574-REG/apple_mtpm3ll_a_iphone_15_128gb.html' },
      adorama: { price: 699, inStock: true, url: 'https://www.adorama.com/ac12815p.html' }
    }
  },
  // iPhone 14 series
  {
    id: 'iphone-14-pro-max-256',
    name: 'iPhone 14 Pro Max',
    modelNumber: 'A2651',
    sku: 'MQ8W3LL/A',
    category: 'iphone',
    releaseDate: '2022-09-16',
    specs: { storage: '256GB', color: 'Deep Purple', display: '6.7" Super Retina XDR', chip: 'A16' },
    prices: {
      apple: { price: 1199, inStock: false },
      amazon: { price: 999, inStock: true, url: 'https://www.amazon.com/dp/B0BN91FLRC' },
      bestbuy: { price: 999, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-14-pro-max-256gb-deep-purple-unlocked/MQ8W3LL-A' },
      walmart: { price: 999, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-14-Pro-Max-256GB-Deep-Purple/1662380588' },
      bh: { price: 999, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1730318-REG/apple_mq8w3ll_a_iphone_14_pro_max.html' },
      adorama: { price: 999, inStock: true, url: 'https://www.adorama.com/ac25614pmaxdp.html' }
    }
  },
  {
    id: 'iphone-14-256',
    name: 'iPhone 14',
    modelNumber: 'A2649',
    sku: 'MPW83LL/A',
    category: 'iphone',
    releaseDate: '2022-09-16',
    specs: { storage: '256GB', color: 'Blue', display: '6.1" Super Retina XDR', chip: 'A15' },
    prices: {
      apple: { price: 699, inStock: true, url: 'https://www.apple.com/shop/buy-iphone/iphone-14' },
      amazon: { price: 599, inStock: true, url: 'https://www.amazon.com/dp/B0BN92KJD4' },
      bestbuy: { price: 599, inStock: true, url: 'https://www.bestbuy.com/site/apple-iphone-14-256gb-blue-unlocked/MPW83LL-A' },
      walmart: { price: 599, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPhone-14-256GB-Blue/1658580932' },
      target: { price: 599, inStock: true, url: 'https://www.target.com/p/apple-iphone-14/-/A-89345365' },
      bh: { price: 599, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1729704-REG/apple_mpw83ll_a_iphone_14_256gb.html' },
      adorama: { price: 599, inStock: true, url: 'https://www.adorama.com/ac25614b.html' }
    }
  },
  // iPad Pro M4
  {
    id: 'ipad-pro-13-m4-256',
    name: 'iPad Pro 13"',
    modelNumber: 'A2925',
    sku: 'MVX23LL/A',
    category: 'ipad',
    releaseDate: '2024-05-15',
    specs: { storage: '256GB', color: 'Space Black', display: '13" Ultra Retina XDR', chip: 'M4' },
    prices: {
      apple: { price: 1299, inStock: true, url: 'https://www.apple.com/shop/buy-ipad/ipad-pro' },
      amazon: { price: 1299, inStock: true, url: 'https://www.amazon.com/dp/B0D3J5Z9SX' },
      bestbuy: { price: 1299, inStock: true, url: 'https://www.bestbuy.com/site/apple-ipad-pro-13-inch-m4-chip-wi-fi-256gb-space-black/MVX23LL-A' },
      walmart: { price: 1299, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPad-Pro-13-inch-M4-256GB-Wi-Fi-Space-Black/5038464532' },
      bh: { price: 1299, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1794196-REG/apple_mvx23ll_a_ipad_pro_13_m4.html' },
      adorama: { price: 1299, inStock: true, url: 'https://www.adorama.com/ac25613pm4sb.html' }
    }
  },
  {
    id: 'ipad-pro-11-m4-256',
    name: 'iPad Pro 11"',
    modelNumber: 'A2836',
    sku: 'MVV93LL/A',
    category: 'ipad',
    releaseDate: '2024-05-15',
    specs: { storage: '256GB', color: 'Silver', display: '11" Ultra Retina XDR', chip: 'M4' },
    prices: {
      apple: { price: 999, inStock: true, url: 'https://www.apple.com/shop/buy-ipad/ipad-pro' },
      amazon: { price: 999, inStock: true, url: 'https://www.amazon.com/dp/B0D3J6D5V8' },
      bestbuy: { price: 999, inStock: true, url: 'https://www.bestbuy.com/site/apple-ipad-pro-11-inch-m4-chip-wi-fi-256gb-silver/MVV93LL-A' },
      walmart: { price: 999, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPad-Pro-11-inch-M4-256GB-Wi-Fi-Silver/5038464528' },
      bh: { price: 999, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1794193-REG/apple_mvv93ll_a_ipad_pro_11_m4.html' },
      adorama: { price: 999, inStock: true, url: 'https://www.adorama.com/ac25611pm4s.html' }
    }
  },
  // iPad Air M3
  {
    id: 'ipad-air-13-m3-256',
    name: 'iPad Air 13"',
    modelNumber: 'A3268',
    sku: 'MCNN4LL/A',
    category: 'ipad',
    releaseDate: '2025-03-12',
    specs: { storage: '256GB', color: 'Space Gray', display: '13" Liquid Retina', chip: 'M3' },
    prices: {
      apple: { price: 799, inStock: true, url: 'https://www.apple.com/shop/buy-ipad/ipad-air' },
      amazon: { price: 799, inStock: true, url: 'https://www.amazon.com/dp/B0D3J3C1QD' },
      bestbuy: { price: 799, inStock: true, url: 'https://www.bestbuy.com/site/apple-ipad-air-13-inch-m3-chip-wi-fi-256gb-space-gray/MCNN4LL-A' },
      walmart: { price: 799, inStock: true, url: 'https://www.walmart.com/ip/Apple-13-inch-iPad-Air-M3-Wi-Fi-256GB-Space-Gray/5257747932' },
      bh: { price: 799, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1812269-REG/apple_mcnn4ll_a_ipad_air_13_m3.html' },
      adorama: { price: 799, inStock: true, url: 'https://www.adorama.com/ac25613m3sg.html' }
    }
  },
  {
    id: 'ipad-air-11-m3-256',
    name: 'iPad Air 11"',
    modelNumber: 'A3266',
    sku: 'MCA14LL/A',
    category: 'ipad',
    releaseDate: '2025-03-12',
    specs: { storage: '256GB', color: 'Blue', display: '11" Liquid Retina', chip: 'M3' },
    prices: {
      apple: { price: 599, inStock: true, url: 'https://www.apple.com/shop/buy-ipad/ipad-air' },
      amazon: { price: 599, inStock: true, url: 'https://www.amazon.com/dp/B0D3J5Z9SY' },
      bestbuy: { price: 599, inStock: true, url: 'https://www.bestbuy.com/site/apple-ipad-air-11-inch-m3-chip-wi-fi-256gb-blue/MCA14LL-A' },
      walmart: { price: 599, inStock: true, url: 'https://www.walmart.com/ip/Apple-11-inch-iPad-Air-M3-Wi-Fi-256GB-Blue/5257747928' },
      bh: { price: 599, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1812268-REG/apple_mca14ll_a_ipad_air_11_m3.html' },
      adorama: { price: 599, inStock: true, url: 'https://www.adorama.com/ac25611m3b.html' }
    }
  },
  // iPad mini
  {
    id: 'ipad-mini-7-128',
    name: 'iPad mini 7',
    modelNumber: 'A2993',
    sku: 'MXN63LL/A',
    category: 'ipad',
    releaseDate: '2024-10-23',
    specs: { storage: '128GB', color: 'Starlight', display: '8.3" Liquid Retina', chip: 'A17 Pro' },
    prices: {
      apple: { price: 499, inStock: true, url: 'https://www.apple.com/shop/buy-ipad/ipad-mini' },
      amazon: { price: 499, inStock: true, url: 'https://www.amazon.com/dp/B0DKLHHMZ7' },
      bestbuy: { price: 499, inStock: true, url: 'https://www.bestbuy.com/site/apple-ipad-mini-7th-generation-a17-pro-chip-wi-fi-128gb-starlight/MXN63LL-A' },
      walmart: { price: 499, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPad-mini-A17-Pro-128GB-Wi-Fi-Starlight/5257747936' },
      bh: { price: 499, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1807698-REG/apple_mxn63ll_a_ipad_mini_7_128gb.html' },
      adorama: { price: 499, inStock: true, url: 'https://www.adorama.com/ac128mini7s.html' }
    }
  },
  {
    id: 'ipad-mini-6-64',
    name: 'iPad mini 6',
    modelNumber: 'A2567',
    sku: 'FK7M3LL/A',
    category: 'ipad',
    releaseDate: '2021-09-24',
    specs: { storage: '64GB', color: 'Space Gray', display: '8.3" Liquid Retina', chip: 'A15' },
    prices: {
      apple: { price: 499, inStock: true, url: 'https://www.apple.com/shop/buy-ipad/ipad-mini' },
      amazon: { price: 399, inStock: true, url: 'https://www.amazon.com/dp/B09G9CJM1Z' },
      bestbuy: { price: 399, inStock: true, url: 'https://www.bestbuy.com/site/apple-ipad-mini-6th-generation-wi-fi-64gb-space-gray/FK7M3LL-A' },
      walmart: { price: 399, inStock: true, url: 'https://www.walmart.com/ip/Apple-10-9-inch-iPad-mini-Wi-Fi-64GB-Space-Gray/484883633' },
      bh: { price: 399, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1647629-REG/apple_fk7m3ll_a_ipad_mini_6_64gb.html' },
      adorama: { price: 399, inStock: true, url: 'https://www.adorama.com/ac64m6sg.html' }
    }
  },
  // iPad 10th Gen
  {
    id: 'ipad-10-256',
    name: 'iPad 10th Gen',
    modelNumber: 'A2757',
    sku: 'FPQ83LL/A',
    category: 'ipad',
    releaseDate: '2022-10-26',
    specs: { storage: '256GB', color: 'Silver', display: '10.9" Liquid Retina', chip: 'A14' },
    prices: {
      apple: { price: 599, inStock: true, url: 'https://www.apple.com/shop/buy-ipad/ipad' },
      amazon: { price: 549, inStock: true, url: 'https://www.amazon.com/dp/B0BJLFC67L' },
      bestbuy: { price: 549, inStock: true, url: 'https://www.bestbuy.com/site/apple-ipad-10th-generation-wi-fi-256gb-silver/FPQ83LL-A' },
      walmart: { price: 549, inStock: true, url: 'https://www.walmart.com/ip/Apple-iPad-10th-Gen-256GB-Wi-Fi-Silver/1658580928' },
      bh: { price: 549, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1729700-REG/apple_fpq83ll_a_ipad_10th_gen.html' },
      adorama: { price: 549, inStock: true, url: 'https://www.adorama.com/ac25610s.html' }
    }
  },
  // iPad Air M2
  {
    id: 'ipad-air-m2-11-256',
    name: 'iPad Air 11" M2',
    modelNumber: 'A2902',
    sku: 'FV203LL/A',
    category: 'ipad',
    releaseDate: '2024-05-15',
    specs: { storage: '256GB', color: 'Purple', display: '11" Liquid Retina', chip: 'M2' },
    prices: {
      apple: { price: 699, inStock: true, url: 'https://www.apple.com/shop/buy-ipad/ipad-air' },
      amazon: { price: 649, inStock: true, url: 'https://www.amazon.com/dp/B0D3J6LVMG' },
      bestbuy: { price: 649, inStock: true, url: 'https://www.bestbuy.com/site/apple-ipad-air-11-inch-m2-chip-wi-fi-256gb-purple/FV203LL-A' },
      walmart: { price: 649, inStock: true, url: 'https://www.walmart.com/ip/Apple-11-inch-iPad-Air-M2-Wi-Fi-256GB-Purple/5038464519' },
      bh: { price: 649, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1794201-REG/apple_fv203ll_a_ipad_air_11_m2.html' },
      adorama: { price: 649, inStock: true, url: 'https://www.adorama.com/ac25611m2p.html' }
  },
  // === MACBOOK PRODUCTS FROM PDF ===
  {
    id: 'macbook-air-13-m4-24gb',
    name: 'MacBook Air 13"',
    modelNumber: 'A3240',
    sku: 'MC654LL/A',
    category: 'mac',
    releaseDate: '2025-03-12',
    specs: { chip: 'M4', color: 'Midnight', storage: '256GB SSD', ram: '24GB', display: '13.6" Liquid Retina' },
    prices: {
      apple: { price: 1199, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-air' },
      amazon: { price: 1199, inStock: true, url: 'https://www.amazon.com/dp/B0DKLHHMZ4' },
      bestbuy: { price: 1199, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-air-13-inch-laptop-m4-chip-24gb-memory-256gb-ssd-midnight/MC654LL-A' },
      walmart: { price: 1199, inStock: true, url: 'https://www.walmart.com/ip/Apple-13-inch-MacBook-Air-M4-24GB-256GB-Midnight/15481367422' },
      bh: { price: 1199, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1811193-REG/apple_mc654ll_a_macbook_air_13_m4.html' },
      adorama: { price: 1199, inStock: true, url: 'https://www.adorama.com/acmba1324m4.html' }
    }
  },
  {
    id: 'macbook-air-15-m4-24gb',
    name: 'MacBook Air 15"',
    modelNumber: 'A3241',
    sku: 'MC6J4LL/A',
    category: 'mac',
    releaseDate: '2025-03-12',
    specs: { chip: 'M4', color: 'Starlight', storage: '256GB SSD', ram: '24GB', display: '15.3" Liquid Retina' },
    prices: {
      apple: { price: 1399, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-air' },
      amazon: { price: 1399, inStock: true, url: 'https://www.amazon.com/dp/B0DKLJ8X7L' },
      bestbuy: { price: 1399, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-air-15-inch-laptop-m4-chip-24gb-memory-256gb-ssd-starlight/MC6J4LL-A' },
      walmart: { price: 1399, inStock: true, url: 'https://www.walmart.com/ip/Apple-15-inch-MacBook-Air-M4-24GB-256GB-Starlight/15481367423' },
      bh: { price: 1399, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1811196-REG/apple_mc6j4ll_a_macbook_air_15_m4.html' },
      adorama: { price: 1399, inStock: true, url: 'https://www.adorama.com/acmba1524m4.html' }
    }
  },
  {
    id: 'macbook-air-13-m3-8gb',
    name: 'MacBook Air 13"',
    modelNumber: 'A3114',
    sku: 'MRXN3LL/A',
    category: 'mac',
    releaseDate: '2024-03-08',
    specs: { chip: 'M3', color: 'Silver', storage: '256GB SSD', ram: '8GB', display: '13.6" Liquid Retina' },
    prices: {
      apple: { price: 1099, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-air' },
      amazon: { price: 999, inStock: true, url: 'https://www.amazon.com/dp/B0CM5JV26D' },
      bestbuy: { price: 999, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-air-13-inch-laptop-m3-chip-8gb-memory-256gb-ssd-silver/MRXN3LL-A' },
      walmart: { price: 999, inStock: true, url: 'https://www.walmart.com/ip/Apple-2024-MacBook-Air-13-inch-Laptop-with-M3-chip-8GB-256GB-Silver/5354013022' },
      bh: { price: 999, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1780500-REG/apple_mrxn3ll_a_macbook_air_13_m3.html' },
      adorama: { price: 999, inStock: true, url: 'https://www.adorama.com/ac256m3s.html' }
    }
  },
  {
    id: 'macbook-air-15-m3-8gb',
    name: 'MacBook Air 15"',
    modelNumber: 'A3114',
    sku: 'MRYM3LL/A',
    category: 'mac',
    releaseDate: '2024-03-08',
    specs: { chip: 'M3', color: 'Midnight', storage: '256GB SSD', ram: '8GB', display: '15.3" Liquid Retina' },
    prices: {
      apple: { price: 1299, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-air' },
      amazon: { price: 1199, inStock: true, url: 'https://www.amazon.com/dp/B0CM5JV268' },
      bestbuy: { price: 1199, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-air-15-inch-laptop-m3-chip-8gb-memory-256gb-ssd-midnight/MRYM3LL-A' },
      walmart: { price: 1199, inStock: true, url: 'https://www.walmart.com/ip/Apple-2024-MacBook-Air-15-inch-Laptop-with-M3-chip-8GB-256GB-Midnight/5354013023' },
      bh: { price: 1199, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1780503-REG/apple_mrym3ll_a_macbook_air_15_m3.html' },
      adorama: { price: 1199, inStock: true, url: 'https://www.adorama.com/ac25615m3m.html' }
    }
  },
  {
    id: 'macbook-air-13-m2-8gb',
    name: 'MacBook Air 13"',
    modelNumber: 'A2681',
    sku: 'MLXW3LL/A',
    category: 'mac',
    releaseDate: '2022-06-15',
    specs: { chip: 'M2', color: 'Space Gray', storage: '256GB SSD', ram: '8GB', display: '13.6" Liquid Retina' },
    prices: {
      apple: { price: 999, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-air' },
      amazon: { price: 849, inStock: true, url: 'https://www.amazon.com/dp/B0B3C2R8MP' },
      bestbuy: { price: 849, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-air-13-inch-laptop-m2-chip-8gb-memory-256gb-ssd-space-gray/MLXW3LL-A' },
      walmart: { price: 849, inStock: true, url: 'https://www.walmart.com/ip/Apple-MacBook-Air-13-6-8GB-256GB-M2-GPU-8-Core-CPU-8-Core-Space-Gray/495521280' },
      bh: { price: 849, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1710366-REG/apple_mlxw3ll_a_macbook_air_13_m2.html' },
      adorama: { price: 849, inStock: true, url: 'https://www.adorama.com/ac256m2sg.html' }
    }
  },
  // MacBook Pro
  {
    id: 'macbook-pro-16-m4-pro',
    name: 'MacBook Pro 16"',
    modelNumber: 'A3403',
    sku: 'MX2X3LL/A',
    category: 'mac',
    releaseDate: '2024-11-08',
    specs: { chip: 'M4 Pro', color: 'Space Black', storage: '512GB SSD', ram: '24GB', display: '16.2" Liquid Retina XDR' },
    prices: {
      apple: { price: 2499, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-pro' },
      amazon: { price: 2499, inStock: true, url: 'https://www.amazon.com/dp/B0DKLHHMZ6' },
      bestbuy: { price: 2499, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-pro-16-inch-laptop-m4-pro-chip-24gb-memory-512gb-ssd-space-black/MX2X3LL-A' },
      walmart: { price: 2499, inStock: true, url: 'https://www.walmart.com/ip/Apple-16-inch-MacBook-Pro-M4-Pro-24GB-512GB-Space-Black/13679766553' },
      bh: { price: 2499, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1811197-REG/apple_mx2x3ll_a_macbook_pro_16_m4.html' },
      adorama: { price: 2499, inStock: true, url: 'https://www.adorama.com/acmbp1624m4p.html' }
    }
  },
  {
    id: 'macbook-pro-14-m4-pro',
    name: 'MacBook Pro 14"',
    modelNumber: 'A3401',
    sku: 'MX2T3LL/A',
    category: 'mac',
    releaseDate: '2024-11-08',
    specs: { chip: 'M4 Pro', color: 'Space Black', storage: '512GB SSD', ram: '24GB', display: '14.2" Liquid Retina XDR' },
    prices: {
      apple: { price: 1999, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-pro' },
      amazon: { price: 1999, inStock: true, url: 'https://www.amazon.com/dp/B0DKLHHMZ5' },
      bestbuy: { price: 1999, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-pro-14-inch-laptop-m4-pro-chip-24gb-memory-512gb-ssd-space-black/MX2T3LL-A' },
      walmart: { price: 1999, inStock: true, url: 'https://www.walmart.com/ip/Apple-14-inch-MacBook-Pro-M4-Pro-24GB-512GB-Space-Black/13679766552' },
      bh: { price: 1999, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1811194-REG/apple_mx2t3ll_a_macbook_pro_14_m4.html' },
      adorama: { price: 1999, inStock: true, url: 'https://www.adorama.com/acmbp1424m4p.html' }
    }
  },
  {
    id: 'macbook-pro-14-m4',
    name: 'MacBook Pro 14"',
    modelNumber: 'A3400',
    sku: 'MCX03LL/A',
    category: 'mac',
    releaseDate: '2024-11-08',
    specs: { chip: 'M4', color: 'Silver', storage: '512GB SSD', ram: '16GB', display: '14.2" Liquid Retina XDR' },
    prices: {
      apple: { price: 1599, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-pro' },
      amazon: { price: 1599, inStock: true, url: 'https://www.amazon.com/dp/B0DKLHH7T4' },
      bestbuy: { price: 1599, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-pro-14-inch-laptop-m4-chip-16gb-memory-512gb-ssd-silver/MCX03LL-A' },
      walmart: { price: 1599, inStock: true, url: 'https://www.walmart.com/ip/Apple-14-inch-MacBook-Pro-M4-16GB-512GB-Silver/13679766551' },
      bh: { price: 1599, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1811195-REG/apple_mcx03ll_a_macbook_pro_14_m4.html' },
      adorama: { price: 1599, inStock: true, url: 'https://www.adorama.com/acmbp1416m4.html' }
    }
  },
  {
    id: 'macbook-pro-16-m3-pro',
    name: 'MacBook Pro 16"',
    modelNumber: 'A2991',
    sku: 'MNWG3LL/A',
    category: 'mac',
    releaseDate: '2023-11-07',
    specs: { chip: 'M3 Pro', color: 'Space Black', storage: '512GB SSD', ram: '18GB', display: '16.2" Liquid Retina XDR' },
    prices: {
      apple: { price: 2299, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-pro' },
      amazon: { price: 1999, inStock: true, url: 'https://www.amazon.com/dp/B0BSHF7LLL' },
      bestbuy: { price: 1999, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-pro-16-inch-laptop-m3-pro-chip-18gb-memory-512gb-ssd-space-black/MNWG3LL-A' },
      walmart: { price: 1999, inStock: true, url: 'https://www.walmart.com/ip/Apple-MacBook-Pro-16-inch-M3-Pro-chip-18GB-512GB-Space-Black/5007285492' },
      bh: { price: 1999, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1784382-REG/apple_mnwg3ll_a_macbook_pro_16_m3.html' },
      adorama: { price: 1999, inStock: true, url: 'https://www.adorama.com/ac51216m3psb.html' }
    }
  },
  {
    id: 'macbook-pro-14-m3',
    name: 'MacBook Pro 14"',
    modelNumber: 'A2990',
    sku: 'MRX23LL/A',
    category: 'mac',
    releaseDate: '2023-11-07',
    specs: { chip: 'M3', color: 'Space Gray', storage: '512GB SSD', ram: '8GB', display: '14.2" Liquid Retina XDR' },
    prices: {
      apple: { price: 1599, inStock: true, url: 'https://www.apple.com/shop/buy-mac/macbook-pro' },
      amazon: { price: 1399, inStock: true, url: 'https://www.amazon.com/dp/B0BSHF7J5L' },
      bestbuy: { price: 1399, inStock: true, url: 'https://www.bestbuy.com/site/apple-macbook-pro-14-inch-laptop-m3-chip-8gb-memory-512gb-ssd-space-gray/MRX23LL-A' },
      walmart: { price: 1399, inStock: true, url: 'https://www.walmart.com/ip/Apple-MacBook-Pro-14-inch-M3-chip-8GB-512GB-Space-Gray/5007285490' },
      bh: { price: 1399, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1784380-REG/apple_mrx23ll_a_macbook_pro_14_m3.html' },
      adorama: { price: 1399, inStock: true, url: 'https://www.adorama.com/ac51214m3sg.html' }
    }
  },
  // Mac mini
  {
    id: 'mac-mini-m4-16gb',
    name: 'Mac mini',
    modelNumber: 'A3238',
    sku: 'MU9D3LL/A',
    category: 'mac',
    releaseDate: '2024-11-08',
    specs: { chip: 'M4', color: 'Silver', storage: '256GB SSD', ram: '16GB', ports: '3x Thunderbolt 4' },
    prices: {
      apple: { price: 599, inStock: true, url: 'https://www.apple.com/shop/buy-mac/mac-mini' },
      amazon: { price: 599, inStock: true, url: 'https://www.amazon.com/dp/B0DKLHHMZ5' },
      bestbuy: { price: 599, inStock: true, url: 'https://www.bestbuy.com/site/apple-mac-mini-desktop-m4-chip-16gb-memory-256gb-ssd-silver/MU9D3LL-A' },
      walmart: { price: 599, inStock: true, url: 'https://www.walmart.com/ip/Apple-2024-Mac-mini-Desktop-Computer-with-M4-chip-10-core-CPU-10-core-GPU-16GB-Unified-Memory-256GB/5406222929' },
      bh: { price: 599, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1811195-REG/apple_mu9d3ll_a_mac_mini_m4.html' },
      adorama: { price: 599, inStock: true, url: 'https://www.adorama.com/acmacminim4.html' }
    }
  },
  {
    id: 'mac-mini-m4-pro',
    name: 'Mac mini',
    modelNumber: 'A3239',
    sku: 'MCX44LL/A',
    category: 'mac',
    releaseDate: '2024-11-08',
    specs: { chip: 'M4 Pro', color: 'Silver', storage: '512GB SSD', ram: '24GB', ports: '3x Thunderbolt 4' },
    prices: {
      apple: { price: 1399, inStock: true, url: 'https://www.apple.com/shop/buy-mac/mac-mini' },
      amazon: { price: 1399, inStock: true, url: 'https://www.amazon.com/dp/B0DKLJ8X7M' },
      bestbuy: { price: 1399, inStock: true, url: 'https://www.bestbuy.com/site/apple-mac-mini-desktop-m4-pro-chip-24gb-memory-512gb-ssd-silver/MCX44LL-A' },
      walmart: { price: 1399, inStock: true, url: 'https://www.walmart.com/ip/Apple-2024-Mac-mini-Desktop-Computer-with-M4-Pro-chip-14-core-CPU-20-core-GPU-24GB-Unified-Memory-512GB/5406222930' },
      bh: { price: 1399, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1811196-REG/apple_mcx44ll_a_mac_mini_m4_pro.html' },
      adorama: { price: 1399, inStock: true, url: 'https://www.adorama.com/acmacminim4p.html' }
    }
  },
  {
    id: 'mac-mini-m2-8gb',
    name: 'Mac mini',
    modelNumber: 'A2686',
    sku: 'MMFJ3LL/A',
    category: 'mac',
    releaseDate: '2023-01-24',
    specs: { chip: 'M2', color: 'Silver', storage: '256GB SSD', ram: '8GB', ports: '2x Thunderbolt 4' },
    prices: {
      apple: { price: 499, inStock: true, url: 'https://www.apple.com/shop/buy-mac/mac-mini' },
      amazon: { price: 449, inStock: true, url: 'https://www.amazon.com/dp/B0BSHF7J5K' },
      bestbuy: { price: 449, inStock: true, url: 'https://www.bestbuy.com/site/apple-mac-mini-desktop-m2-chip-8gb-memory-256gb-ssd-silver/MMFJ3LL-A' },
      walmart: { price: 449, inStock: true, url: 'https://www.walmart.com/ip/Apple-Mac-mini-M2-chip-8GB-256GB/1652174355' },
      bh: { price: 449, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1730319-REG/apple_mmfj3ll_a_mac_mini_m2.html' },
      adorama: { price: 449, inStock: true, url: 'https://www.adorama.com/ac256m2.html' }
    }
  },
  // Apple Watch
  {
    id: 'apple-watch-ultra-2',
    name: 'Apple Watch Ultra 2',
    modelNumber: 'A2986',
    sku: 'MQDY3LL/A',
    category: 'watch',
    releaseDate: '2024-09-20',
    specs: { size: '49mm', case: 'Natural Titanium', band: 'Orange Alpine Loop', features: 'GPS + Cellular' },
    prices: {
      apple: { price: 799, inStock: true, url: 'https://www.apple.com/shop/buy-watch/apple-watch-ultra' },
      amazon: { price: 749, inStock: true, url: 'https://www.amazon.com/dp/B0CHX1W1XY' },
      bestbuy: { price: 749, inStock: true, url: 'https://www.bestbuy.com/site/apple-watch-ultra-2-gps-cellular-49mm-natural-titanium-case-with-orange-alpine-loop-medium/MQDY3LL-A' },
      walmart: { price: 749, inStock: true, url: 'https://www.walmart.com/ip/Apple-Watch-Ultra-2-GPS-Cellular-49mm-Natural-Titanium-Case-with-Orange-Alpine-Loop-Medium/5000354050' },
      bh: { price: 749, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800560-REG/apple_mqdy3ll_a_watch_ultra_2.html' },
      adorama: { price: 749, inStock: true, url: 'https://www.adorama.com/ac49u2oal.html' }
    }
  },
  {
    id: 'apple-watch-series-10-46mm',
    name: 'Apple Watch Series 10',
    modelNumber: 'A2999',
    sku: 'MXL83LL/A',
    category: 'watch',
    releaseDate: '2024-09-20',
    specs: { size: '46mm', case: 'Jet Black Aluminum', band: 'Black Sport Band', features: 'GPS' },
    prices: {
      apple: { price: 429, inStock: true, url: 'https://www.apple.com/shop/buy-watch/apple-watch' },
      amazon: { price: 399, inStock: true, url: 'https://www.amazon.com/dp/B0DGHQ72MX' },
      bestbuy: { price: 399, inStock: true, url: 'https://www.bestbuy.com/site/apple-watch-series-10-gps-46mm-jet-black-aluminum-case-with-black-sport-band-m-l/MXL83LL-A' },
      walmart: { price: 399, inStock: true, url: 'https://www.walmart.com/ip/Apple-Watch-Series-10-GPS-46mm-Jet-Black-Aluminum-Case-with-Black-Sport-Band-M-L/11385157009' },
      target: { price: 399, inStock: true, url: 'https://www.target.com/p/apple-watch-series-10-gps-46mm-jet-black-aluminum-case-with-black-sport-band-m-l/-/A-91122499' },
      bh: { price: 399, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800556-REG/apple_mxl83ll_a_watch_series_10.html' },
      adorama: { price: 399, inStock: true, url: 'https://www.adorama.com/ac46s10jb.html' }
    }
  },
  {
    id: 'apple-watch-se-44mm',
    name: 'Apple Watch SE 2nd Gen',
    modelNumber: 'A2723',
    sku: 'MXEK3LL/A',
    category: 'watch',
    releaseDate: '2024-09-20',
    specs: { size: '44mm', case: 'Midnight Aluminum', band: 'Midnight Sport Band', features: 'GPS' },
    prices: {
      apple: { price: 249, inStock: true, url: 'https://www.apple.com/shop/buy-watch/apple-watch-se' },
      amazon: { price: 219, inStock: true, url: 'https://www.amazon.com/dp/B0DGHQ6F8X' },
      bestbuy: { price: 219, inStock: true, url: 'https://www.bestbuy.com/site/apple-watch-se-2nd-generation-gps-44mm-midnight-aluminum-case-with-midnight-sport-band-s-m/MXEK3LL-A' },
      walmart: { price: 219, inStock: true, url: 'https://www.walmart.com/ip/Apple-Watch-SE-2nd-Gen-GPS-44mm-Midnight-Aluminum-Case-with-Midnight-Sport-Band-S-M/11385157007' },
      target: { price: 219, inStock: true, url: 'https://www.target.com/p/apple-watch-se-2nd-generation-gps-44mm-midnight-aluminum-case-with-midnight-sport-band-s-m/-/A-91122497' },
      bh: { price: 219, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1800554-REG/apple_mxek3ll_a_watch_se_44mm.html' },
      adorama: { price: 219, inStock: true, url: 'https://www.adorama.com/ac44se2m.html' }
    }
  },
  {
    id: 'apple-watch-series-9-45mm',
    name: 'Apple Watch Series 9',
    modelNumber: 'A2980',
    sku: 'MRJ83LL/A',
    category: 'watch',
    releaseDate: '2023-09-22',
    specs: { size: '45mm', case: 'Midnight Aluminum', band: 'Midnight Sport Band', features: 'GPS' },
    prices: {
      apple: { price: 329, inStock: true, url: 'https://www.apple.com/shop/buy-watch/apple-watch' },
      amazon: { price: 299, inStock: true, url: 'https://www.amazon.com/dp/B0CHX4F374' },
      bestbuy: { price: 299, inStock: true, url: 'https://www.bestbuy.com/site/apple-watch-series-9-gps-45mm-midnight-aluminum-case-with-midnight-sport-band-s-m/MRJ83LL-A' },
      walmart: { price: 299, inStock: true, url: 'https://www.walmart.com/ip/Apple-Watch-Series-9-GPS-45mm-Midnight-Aluminum-Case-with-Midnight-Sport-Band-S-M/5000354049' },
      bh: { price: 299, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1782598-REG/apple_mrj83ll_a_watch_series_9.html' },
      adorama: { price: 299, inStock: true, url: 'https://www.adorama.com/ac45s9m.html' }
    }
  },
  // AirPods from PDF
  {
    id: 'airpods-pro-2-usb-c',
    name: 'AirPods Pro 2',
    modelNumber: 'A3047/A3048',
    sku: 'MTJV3AM/A',
    category: 'airpods',
    releaseDate: '2023-09-22',
    specs: { features: 'USB-C MagSafe Case, Active Noise Cancellation, Transparency' },
    prices: {
      apple: { price: 249, inStock: true, url: 'https://www.apple.com/shop/product/MTJV3AM/A/airpods-pro' },
      amazon: { price: 229, inStock: true, url: 'https://www.amazon.com/dp/B0CHX2F9QT' },
      bestbuy: { price: 249, inStock: true, url: 'https://www.bestbuy.com/site/apple-airpods-pro-2-wireless-active-noise-cancelling-earbuds-hearing-aid-feature-bluetooth-headphones-with-magsafe-charging-case-usbc-white/5720312.p' },
      walmart: { price: 229, inStock: true, url: 'https://www.walmart.com/ip/Apple-AirPods-Pro-2nd-Generation-with-MagSafe-Case-USB-C/5043748016' },
      target: { price: 249, inStock: true, url: 'https://www.target.com/p/apple-airpods-pro-2nd-generation/-/A-85978618' },
      bh: { price: 249, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1733640-REG/apple_mtjv3am_a_airpods_pro_2nd.html' },
      adorama: { price: 249, inStock: true, url: 'https://www.adorama.com/acmtjv3ama.html' }
    }
  },
  {
    id: 'airpods-4-anc',
    name: 'AirPods 4',
    modelNumber: 'A3170/A3171',
    sku: 'MU9A3AM/A',
    category: 'airpods',
    releaseDate: '2024-09-20',
    specs: { features: 'Active Noise Cancellation, Spatial Audio, USB-C' },
    prices: {
      apple: { price: 179, inStock: true, url: 'https://www.apple.com/shop/buy-airpods/airpods-4' },
      amazon: { price: 169, inStock: true, url: 'https://www.amazon.com/dp/B0D1XD1ZV3' },
      bestbuy: { price: 179, inStock: true, url: 'https://www.bestbuy.com/site/apple-airpods-4-wireless-earbuds-active-noise-cancelling-bluetooth-headphones-with-magsafe-charging-case-usbc-white/6418599.p' },
      walmart: { price: 169, inStock: true, url: 'https://www.walmart.com/ip/Apple-AirPods-4-with-Active-Noise-Cancellation/11620163840' },
      target: { price: 179, inStock: true, url: 'https://www.target.com/p/apple-airpods-4-with-active-noise-cancellation/-/A-92635832' },
      bh: { price: 179, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1802197-REG/apple_mu9a3am_a_airpods_4_anc.html' },
      adorama: { price: 179, inStock: true, url: 'https://www.adorama.com/acmu9a3ama.html' }
    }
  },
  {
    id: 'airpods-max-usb-c',
    name: 'AirPods Max',
    modelNumber: 'A2053',
    sku: 'MQTP3LL/A',
    category: 'airpods',
    releaseDate: '2024-09-20',
    specs: { features: 'USB-C, Spatial Audio, Active Noise Cancellation' },
    prices: {
      apple: { price: 549, inStock: true, url: 'https://www.apple.com/shop/buy-airpods/airpods-max' },
      amazon: { price: 499, inStock: true, url: 'https://www.amazon.com/dp/B0D1XD6ZV7' },
      bestbuy: { price: 549, inStock: true, url: 'https://www.bestbuy.com/site/apple-airpods-max-wireless-over-ear-headphones-active-noise-cancelling-bluetooth-midnight/6418591.p' },
      walmart: { price: 499, inStock: true, url: 'https://www.walmart.com/ip/Apple-AirPods-Max-Midnight/15448637505' },
      target: { price: 549, inStock: true, url: 'https://www.target.com/p/apple-airpods-max/-/A-83651668' },
      bh: { price: 549, inStock: true, url: 'https://www.bhphotovideo.com/c/product/1597291-REG/apple_mgyl3am_a_airpods_max_space.html' },
      adorama: { price: 549, inStock: true, url: 'https://www.adorama.com/acmmef2ama.html' }
    }
  }
];

// Add dynamic URLs to products that don't have direct URLs
products.forEach(product => {
  Object.keys(product.prices).forEach(retailer => {
    // Only generate search URL if no direct URL exists
    if (!product.prices[retailer].url) {
      product.prices[retailer].url = generateSearchUrl(retailer, product.name, product.specs);
    }
  });

  if (product.refurbishedPrices) {
    Object.keys(product.refurbishedPrices).forEach(retailer => {
      if (!product.refurbishedPrices[retailer].url) {
        product.refurbishedPrices[retailer].url = generateSearchUrl(retailer, product.name + ' refurbished', product.specs);
      }
    });
  }
});

// Record prices to history (async, don't block response)
async function recordProductPrices(product) {
  for (const [retailer, data] of Object.entries(product.prices)) {
    await recordPrice(product.id, retailer, data.price, data.inStock);
  }
  if (product.refurbishedPrices) {
    for (const [retailer, data] of Object.entries(product.refurbishedPrices)) {
      await recordPrice(`${product.id}_refurb`, retailer, data.price, data.inStock);
    }
  }
}

// API Routes
app.get('/api/products', async (req, res) => {
  const { category } = req.query;
  let result = category 
    ? products.filter(p => p.category === category)
    : products;
  
  // Enrich with affiliate URLs
  result = result.map(enrichProductWithAffiliateUrls);
  
  // Record prices async (don't await, don't block)
  result.forEach(p => recordProductPrices(p).catch(console.error));
  
  res.json(result);
});

app.get('/api/products/:id', async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  // Record prices async
  recordProductPrices(product).catch(console.error);
  
  res.json(enrichProductWithAffiliateUrls(product));
});

// Price History Endpoints
app.get('/api/prices/:id/history', async (req, res) => {
  const { days } = req.query;
  const daysInt = parseInt(days) || 90;
  
  try {
    const history = await getPriceHistory(req.params.id, daysInt);
    res.json({
      productId: req.params.id,
      days: daysInt,
      dataPoints: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

app.get('/api/prices/:id/history/:retailer', async (req, res) => {
  const { days } = req.query;
  const daysInt = parseInt(days) || 90;
  
  try {
    const history = await getRetailerPriceHistory(req.params.id, req.params.retailer, daysInt);
    res.json({
      productId: req.params.id,
      retailer: req.params.retailer,
      days: daysInt,
      dataPoints: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch retailer price history' });
  }
});

// Alert endpoints for n8n
app.get('/api/alerts/price-drops', async (req, res) => {
  const { threshold } = req.query;
  const thresholdFloat = parseFloat(threshold) || 0.05; // 5% default
  
  try {
    const drops = await getPriceDrops(thresholdFloat);
    res.json({
      threshold: thresholdFloat,
      count: drops.length,
      drops
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch price drops' });
  }
});

app.get('/api/alerts/restocked', async (req, res) => {
  try {
    const restocked = await getInventoryChanges();
    res.json({
      count: restocked.length,
      items: restocked
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory changes' });
  }
});

// Admin endpoint to trigger cleanup
app.post('/api/admin/cleanup', async (req, res) => {
  try {
    await cleanupOldData();
    res.json({ message: 'Cleanup completed' });
  } catch (err) {
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

// Retailers endpoint
app.get('/api/retailers', (req, res) => {
  res.json(retailers);
});

// Affiliate status endpoint
app.get('/api/affiliate-status', (req, res) => {
  const status = {};
  for (const [retailer, id] of Object.entries(AFFILIATE_IDS)) {
    status[retailer] = {
      configured: !!id,
      id: id ? 'CONFIGURED' : 'NOT_CONFIGURED'
    };
  }
  res.json({
    status,
    note: 'Set affiliate IDs via environment variables (e.g., AMAZON_ASSOCIATES_TAG)'
  });
});

// Health check - MUST respond quickly for Railway
app.get('/health', async (req, res) => {
  const configuredAffiliates = Object.values(AFFILIATE_IDS).filter(id => !!id).length;
  res.status(200).json({ 
    status: 'ok', 
    version: '2.2-price-history', 
    timestamp: new Date().toISOString(),
    affiliateTracking: true,
    priceHistory: true,
    dbConnected: !!process.env.DATABASE_URL,
    affiliatesConfigured: `${configuredAffiliates}/${Object.keys(AFFILIATE_IDS).length}`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
async function startServer() {
  // Initialize price history table
  if (process.env.DATABASE_URL) {
    try {
      await initPriceHistoryTable();
    } catch (err) {
      console.error('⚠️ Database initialization failed:', err.message);
      console.log('Continuing without price history...');
    }
  } else {
    console.log('⚠️ No DATABASE_URL set — price history disabled');
  }

  // Start server with explicit host binding for Railway
  app.listen(PORT, '0.0.0.0', () => {
    const configuredAffiliates = Object.values(AFFILIATE_IDS).filter(id => !!id).length;
    console.log(`✅ MacTrackr API v2.2-price-history - ${products.length} products`);
    console.log(`📊 Price history: ${process.env.DATABASE_URL ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🔗 Affiliate programs: ${configuredAffiliates}/${Object.keys(AFFILIATE_IDS).length}`);
    console.log(`🚀 Running on port ${PORT}`);
    console.log(`💓 Health: http://0.0.0.0:${PORT}/health`);
    console.log(`📈 Price drops: http://0.0.0.0:${PORT}/api/alerts/price-drops`);
    console.log(`📦 Restocked: http://0.0.0.0:${PORT}/api/alerts/restocked`);
  });
}

startServer();
