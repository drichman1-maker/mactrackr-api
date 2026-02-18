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
    id: 'macbook-pro-14-m5',
    name: 'MacBook Pro 14"',
    modelNumber: 'A3113',
    sku: 'MP5X3LL/A',
    category: 'mac',
    releaseDate: '2026-02-01',
    specs: { chip: 'M5', color: 'Space Black', storage: '512GB SSD', ram: '24GB', display: '14.2" XDR' },
    prices: {
      apple: { price: 1999, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-pro-14/MP5X3LL/A' },
      amazon: { price: 1949, inStock: true, url: 'https://amazon.com/dp/B0DM5NP7X3' },
      walmart: { price: 1999, inStock: true, url: 'https://walmart.com/ip/Apple-MacBook-Pro-14-M5-512GB/975631222' },
      target: { price: 1999, inStock: false, url: 'https://target.com/p/apple-macbook-pro-14-m5/-/A-89012358' },
      bestbuy: { price: 1949, inStock: true, url: 'https://bestbuy.com/site/apple-macbook-pro-14-laptop-m5-chip-24gb-memory-512gb-ssd-space-black/6534589.p' },
      bh: { price: 1949, inStock: true, url: 'https://bhphotovideo.com/c/product/1801684-REG/apple_mp5x3ll_a_14_macbook_pro_with.html' },
      adorama: { price: 1949, inStock: true, url: 'https://www.adorama.com/search?query=MacBook%20Pro%2014' },
      cdw: { price: 1999, inStock: true, url: 'https://cdw.com/product/apple-macbook-pro-14-m5-512gb/7389034' }
    }
  },
  {
    id: 'macbook-pro-14-m5-1tb',
    name: 'MacBook Pro 14"',
    modelNumber: 'A3113',
    sku: 'MHWC3LL/A',
    category: 'mac',
    releaseDate: '2026-02-01',
    specs: { chip: 'M5', color: 'Space Black', storage: '1TB SSD', ram: '32GB', display: '14.2" XDR' },
    prices: {
      apple: { price: 2399, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-pro-14/MHWC3LL/A' },
      amazon: { price: 2349, inStock: true, url: 'https://amazon.com/dp/B0DM5WC3NP' },
      walmart: { price: 2399, inStock: true, url: 'https://walmart.com/ip/Apple-MacBook-Pro-14-M5-1TB/975631223' },
      target: { price: 2399, inStock: false, url: 'https://target.com/p/apple-macbook-pro-14-m5-1tb/-/A-89012359' },
      bestbuy: { price: 2349, inStock: true, url: 'https://bestbuy.com/site/apple-macbook-pro-14-laptop-m5-chip-32gb-memory-1tb-ssd-space-black/6534590.p' },
      bh: { price: 2349, inStock: true, url: 'https://bhphotovideo.com/c/product/1801685-REG/apple_mhwc3ll_a_14_macbook_pro_with.html' },
      adorama: { price: 2349, inStock: true, url: 'https://www.adorama.com/search?query=MacBook%20Pro%2014' },
      cdw: { price: 2399, inStock: true, url: 'https://cdw.com/product/apple-macbook-pro-14-m5-1tb/7389035' }
    }
  },
  {
    id: 'macbook-air-13-m4',
    name: 'MacBook Air 13"',
    modelNumber: 'A3115',
    sku: 'MC5X3LL/A',
    category: 'mac',
    releaseDate: '2026-02-01',
    specs: { chip: 'M4', color: 'Space Gray', storage: '256GB SSD', ram: '16GB', display: '13.6" Liquid Retina' },
    prices: {
      apple: { price: 1099, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-air-13/MC5X3LL/A' },
      amazon: { price: 1049, inStock: true, url: 'https://amazon.com/dp/B0DM5X3NP4' },
      walmart: { price: 1099, inStock: true, url: 'https://walmart.com/ip/Apple-MacBook-Air-13-M4-256GB/975631224' },
      target: { price: 1099, inStock: true, url: 'https://target.com/p/apple-macbook-air-13-m4/-/A-89012360' },
      bestbuy: { price: 1049, inStock: true, url: 'https://bestbuy.com/site/apple-macbook-air-13-laptop-m4-chip-16gb-memory-256gb-ssd-space-gray/6534591.p' },
      bh: { price: 1049, inStock: true, url: 'https://bhphotovideo.com/c/product/1801686-REG/apple_mc5x3ll_a_13_6_macbook_air.html' },
      adorama: { price: 1049, inStock: true, url: 'https://www.adorama.com/search?query=MacBook%20Air%2013' },
      cdw: { price: 1099, inStock: true, url: 'https://cdw.com/product/apple-macbook-air-13-m4-256gb/7389036' }
    }
  },
  {
    id: 'macbook-air-13-m4-512',
    name: 'MacBook Air 13"',
    modelNumber: 'A3115',
    sku: 'MC7V3LL/A',
    category: 'mac',
    releaseDate: '2026-02-01',
    specs: { chip: 'M4', color: 'Space Gray', storage: '512GB SSD', ram: '16GB', display: '13.6" Liquid Retina' },
    prices: {
      apple: { price: 1299, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-air-13/MC7V3LL/A' },
      amazon: { price: 1249, inStock: true, url: 'https://amazon.com/dp/B0DM7V3NP5' },
      walmart: { price: 1299, inStock: true, url: 'https://walmart.com/ip/Apple-MacBook-Air-13-M4-512GB/975631225' },
      target: { price: 1299, inStock: true, url: 'https://target.com/p/apple-macbook-air-13-m4-512gb/-/A-89012361' },
      bestbuy: { price: 1249, inStock: true, url: 'https://bestbuy.com/site/apple-macbook-air-13-laptop-m4-chip-16gb-memory-512gb-ssd-space-gray/6534592.p' },
      bh: { price: 1249, inStock: true, url: 'https://bhphotovideo.com/c/product/1801687-REG/apple_mc7v3ll_a_13_6_macbook_air.html' },
      adorama: { price: 1249, inStock: true, url: 'https://www.adorama.com/search?query=MacBook%20Air%2013' },
      cdw: { price: 1299, inStock: true, url: 'https://cdw.com/product/apple-macbook-air-13-m4-512gb/7389037' }
    }
  },
  {
    id: 'macbook-air-15-m4',
    name: 'MacBook Air 15"',
    modelNumber: 'A3116',
    sku: 'MC9F3LL/A',
    category: 'mac',
    releaseDate: '2026-02-01',
    specs: { chip: 'M4', color: 'Space Gray', storage: '512GB SSD', ram: '16GB', display: '15.3" Liquid Retina' },
    prices: {
      apple: { price: 1499, inStock: true, url: 'https://apple.com/shop/buy-mac/macbook-air-15/MC9F3LL/A' },
      amazon: { price: 1449, inStock: true, url: 'https://amazon.com/dp/B0DM9F3NP6' },
      walmart: { price: 1499, inStock: true, url: 'https://walmart.com/ip/Apple-MacBook-Air-15-M4-512GB/975631226' },
      target: { price: 1499, inStock: true, url: 'https://target.com/p/apple-macbook-air-15-m4/-/A-89012362' },
      bestbuy: { price: 1449, inStock: true, url: 'https://bestbuy.com/site/apple-macbook-air-15-laptop-m4-chip-16gb-memory-512gb-ssd-space-gray/6534593.p' },
      bh: { price: 1449, inStock: true, url: 'https://bhphotovideo.com/c/product/1801688-REG/apple_mc9f3ll_a_15_3_macbook_air.html' },
      adorama: { price: 1449, inStock: true, url: 'https://www.adorama.com/search?query=MacBook%20Air%2015' },
      cdw: { price: 1499, inStock: true, url: 'https://cdw.com/product/apple-macbook-air-15-m4-512gb/7389038' }
    }
  },
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
      adorama: { price: 1649, inStock: true, url: 'https://www.adorama.com/search?query=MacBook%20Pro%2014' },
      ebay: { price: 1599, inStock: true, url: 'https://www.ebay.com/sch/i.html?_nkw=MacBook%20Pro%2014' },
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
      adorama: { price: 2449, inStock: true, url: 'https://www.adorama.com/search?query=MacBook%20Pro%2016' },
      ebay: { price: 2399, inStock: true, url: 'https://www.ebay.com/sch/i.html?_nkw=MacBook%20Pro%2016' },
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
      adorama: { price: 579, inStock: true, url: 'https://www.adorama.com/search?query=Mac%20mini' },
      ebay: { price: 549, inStock: true, url: 'https://www.ebay.com/sch/i.html?_nkw=Mac%20mini' },
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
      adorama: { price: 3899, inStock: true, url: 'https://www.adorama.com/search?query=Mac%20Studio' },
      ebay: { price: 3799, inStock: true, url: 'https://www.ebay.com/sch/i.html?_nkw=Mac%20Studio' },
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
      adorama: { price: 1199, inStock: true, url: 'https://www.adorama.com/search?query=iPhone%2017%20Pro%20Max' },
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
      adorama: { price: 1099, inStock: true, url: 'https://www.adorama.com/search?query=iPhone%2017%20Pro' },
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
      adorama: { price: 899, inStock: true, url: 'https://www.adorama.com/search?query=iPhone%2017%20Air' },
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
      adorama: { price: 999, inStock: true, url: 'https://www.adorama.com/search?query=iPhone%2017' },
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
      adorama: { price: 1099, inStock: true, url: 'https://www.adorama.com/search?query=iPhone%2016%20Pro%20Max' },
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
      adorama: { price: 999, inStock: true, url: 'https://www.adorama.com/search?query=iPhone%2016%20Pro' },
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
      adorama: { price: 899, inStock: true, url: 'https://www.adorama.com/search?query=iPhone%2016%20Plus' },
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
      adorama: { price: 799, inStock: true, url: 'https://www.adorama.com/search?query=iPhone%2016' },
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
      adorama: { price: 599, inStock: true, url: 'https://www.adorama.com/search?query=iPhone%2016e' },
      cdw: { price: 599, inStock: true, url: 'https://cdw.com/product/apple-iphone-16e-128gb/7389033' }
    }
  }
,
  {
    id: 'apple-watch-ultra-2',
    name: 'Apple Watch Ultra 2',
    modelNumber: 'MXDJ3LL/A',
    category: 'watch',
    specs: { size: '49mm', connectivity: 'GPS + Cellular', case: 'Titanium', display: 'Always-On Retina' },
    prices: {
      apple: { price: 799, inStock: true, url: 'https://apple.com/shop/buy-watch/apple-watch-ultra-2/MXDJ3LL/A' },
      amazon: { price: 779, inStock: true, url: 'https://amazon.com/dp/B0CHX3VQP9' },
      walmart: { price: 799, inStock: true, url: 'https://walmart.com/ip/Apple-Watch-Ultra-2-49mm/975631222' },
      target: { price: 799, inStock: true, url: 'https://target.com/p/apple-watch-ultra-2/-/A-89012358' },
      bestbuy: { price: 779, inStock: true, url: 'https://bestbuy.com/site/apple-watch-ultra-2-49mm-titanium-case/6534589.p' },
      bh: { price: 779, inStock: true, url: 'https://bhphotovideo.com/c/product/1801684-REG/apple_mxdj3ll_a_watch_ultra_2.html' },
      adorama: { price: 779, inStock: true, url: 'https://www.adorama.com/search?query=Apple%20Watch%20Ultra%202' },
      cdw: { price: 799, inStock: true, url: 'https://cdw.com/product/apple-watch-ultra-2/7389034' }
    }
  },
  {
    id: 'apple-watch-series-10',
    name: 'Apple Watch Series 10',
    modelNumber: 'MX1J3LL/A',
    category: 'watch',
    specs: { size: '45mm', connectivity: 'GPS', case: 'Aluminum', display: 'Always-On Retina' },
    prices: {
      apple: { price: 399, inStock: true, url: 'https://apple.com/shop/buy-watch/apple-watch/MX1J3LL/A' },
      amazon: { price: 379, inStock: true, url: 'https://amazon.com/dp/B0CHX4NQP8' },
      walmart: { price: 399, inStock: true, url: 'https://walmart.com/ip/Apple-Watch-Series-10/975631223' },
      target: { price: 399, inStock: true, url: 'https://target.com/p/apple-watch-series-10/-/A-89012359' },
      bestbuy: { price: 379, inStock: true, url: 'https://bestbuy.com/site/apple-watch-series-10-45mm-aluminum-gps/6534590.p' },
      bh: { price: 379, inStock: true, url: 'https://bhphotovideo.com/c/product/1801685-REG/apple_mx1j3ll_a_watch_series_10.html' },
      adorama: { price: 379, inStock: true, url: 'https://www.adorama.com/search?query=Apple%20Watch%20Series%2010' },
      cdw: { price: 399, inStock: true, url: 'https://cdw.com/product/apple-watch-series-10/7389035' }
    }
  },
  {
    id: 'apple-watch-series-11',
    name: 'Apple Watch Series 11',
    modelNumber: 'A3100',
    category: 'watch',
    specs: { size: '45mm', connectivity: 'GPS + Cellular', case: 'Aluminum', display: 'Always-On Retina' },
    prices: {
      apple: { price: 499, inStock: true, url: 'https://apple.com/shop/buy-watch/apple-watch/A3100' },
      amazon: { price: 479, inStock: true, url: 'https://amazon.com/dp/B0CHX5MQP7' },
      walmart: { price: 499, inStock: true, url: 'https://walmart.com/ip/Apple-Watch-Series-11/975631224' },
      target: { price: 499, inStock: true, url: 'https://target.com/p/apple-watch-series-11/-/A-89012360' },
      bestbuy: { price: 479, inStock: true, url: 'https://bestbuy.com/site/apple-watch-series-11-45mm-aluminum-cellular/6534591.p' },
      bh: { price: 479, inStock: true, url: 'https://bhphotovideo.com/c/product/1801686-REG/apple_a3100_watch_series_11.html' },
      adorama: { price: 479, inStock: true, url: 'https://www.adorama.com/search?query=Apple%20Watch%20Series%2011' },
      cdw: { price: 499, inStock: true, url: 'https://cdw.com/product/apple-watch-series-11/7389036' }
    }
  },
  {
    id: 'airpods-pro-3',
    name: 'AirPods Pro (3rd Gen)',
    modelNumber: 'A3200',
    category: 'audio',
    specs: { type: 'In-ear', features: ['Active Noise Cancellation', 'Adaptive Audio', 'Transparency Mode'] },
    prices: {
      apple: { price: 249, inStock: true, url: 'https://apple.com/shop/buy-airpods/airpods-pro-3rd-generation/A3200' },
      amazon: { price: 229, inStock: true, url: 'https://amazon.com/dp/B0CHX6LQP6' },
      walmart: { price: 249, inStock: true, url: 'https://walmart.com/ip/AirPods-Pro-3rd-Generation/975631225' },
      target: { price: 249, inStock: true, url: 'https://target.com/p/airpods-pro-3rd-generation/-/A-89012361' },
      bestbuy: { price: 229, inStock: true, url: 'https://bestbuy.com/site/apple-airpods-pro-3rd-generation/6534592.p' },
      bh: { price: 229, inStock: true, url: 'https://bhphotovideo.com/c/product/1801687-REG/apple_a3200_airpods_pro_3.html' },
      adorama: { price: 229, inStock: true, url: 'https://www.adorama.com/search?query=AirPods%20Pro%20(3rd%20Gen)' },
      cdw: { price: 249, inStock: true, url: 'https://cdw.com/product/airpods-pro-3rd-generation/7389037' }
    }
  },
  {
    id: 'airpods-4',
    name: 'AirPods 4 with ANC',
    modelNumber: 'A3100',
    category: 'audio',
    specs: { type: 'In-ear', features: ['Active Noise Cancellation', 'Spatial Audio', 'Adaptive EQ'] },
    prices: {
      apple: { price: 179, inStock: true, url: 'https://apple.com/shop/buy-airpods/airpods-4th-generation/A3100' },
      amazon: { price: 159, inStock: true, url: 'https://amazon.com/dp/B0CHX7KQP5' },
      walmart: { price: 179, inStock: true, url: 'https://walmart.com/ip/AirPods-4-with-ANC/975631226' },
      target: { price: 179, inStock: true, url: 'https://target.com/p/airpods-4-with-anc/-/A-89012362' },
      bestbuy: { price: 159, inStock: true, url: 'https://bestbuy.com/site/apple-airpods-4-with-anc/6534593.p' },
      bh: { price: 159, inStock: true, url: 'https://bhphotovideo.com/c/product/1801688-REG/apple_a3100_airpods_4.html' },
      adorama: { price: 159, inStock: true, url: 'https://www.adorama.com/search?query=AirPods%204%20with%20ANC' },
      cdw: { price: 179, inStock: true, url: 'https://cdw.com/product/airpods-4-with-anc/7389038' }
    }
  },
  {
    id: 'ipad-pro-11-m4',
    name: 'iPad Pro 11" M4',
    modelNumber: 'A3145',
    sku: 'MVV83LL/A',
    category: 'ipad',
    specs: { chip: 'M4', display: '11" Liquid Retina XDR', storage: '128GB' },
    prices: {
      apple: { price: 799, inStock: true, url: 'https://apple.com/shop/buy-ipad/ipad-pro-11/MVV83LL/A' },
      amazon: { price: 799, inStock: true, url: 'https://amazon.com/dp/B0CV77JKLM' },
      bestbuy: { price: 799, inStock: true, url: 'https://bestbuy.com/site/apple-11-inch-ipad-pro-m4-chip-128gb-space-gray/6560123.p' },
      walmart: { price: 799, inStock: true, url: 'https://walmart.com/ip/Apple-11-inch-iPad-Pro-M4/976543210' },
      target: { price: 799, inStock: true, url: 'https://target.com/p/apple-11-inch-ipad-pro-m4/-/A-89054321' },
      bh: { price: 799, inStock: true, url: 'https://bhphotovideo.com/c/product/1802345-REG/apple_mvv83ll_a_11_ipad_pro_m4.html' },
      adorama: { price: 799, inStock: true, url: 'https://www.adorama.com/search?query=iPad%20Pro%2011%20M4' },
      cdw: { price: 799, inStock: true, url: 'https://cdw.com/product/apple-11-inch-ipad-pro-m4/7390123' }
    }
  },
  {
    id: 'ipad-pro-13-m4',
    name: 'iPad Pro 13" M4',
    modelNumber: 'A3146',
    sku: 'MVX23LL/A',
    category: 'ipad',
    specs: { chip: 'M4', display: '12.9" Liquid Retina XDR', storage: '128GB' },
    prices: {
      apple: { price: 1099, inStock: true, url: 'https://apple.com/shop/buy-ipad/ipad-pro-13/MVX23LL/A' },
      amazon: { price: 1099, inStock: true, url: 'https://amazon.com/dp/B0CV77KLMN' },
      bestbuy: { price: 1099, inStock: true, url: 'https://bestbuy.com/site/apple-13-inch-ipad-pro-m4-chip-128gb-space-gray/6560124.p' },
      walmart: { price: 1099, inStock: true, url: 'https://walmart.com/ip/Apple-13-inch-iPad-Pro-M4/976543211' },
      target: { price: 1099, inStock: true, url: 'https://target.com/p/apple-13-inch-ipad-pro-m4/-/A-89054322' },
      bh: { price: 1099, inStock: true, url: 'https://bhphotovideo.com/c/product/1802346-REG/apple_mvx23ll_a_13_ipad_pro_m4.html' },
      adorama: { price: 1099, inStock: true, url: 'https://www.adorama.com/search?query=iPad%20Pro%2013%20M4' },
      cdw: { price: 1099, inStock: true, url: 'https://cdw.com/product/apple-13-inch-ipad-pro-m4/7390124' }
    }
  },
  {
    id: 'ipad-pro-13-m5-wifi',
    name: 'iPad Pro 13" M5 Wi-Fi',
    modelNumber: 'A3147',
    sku: 'MVX43LL/A',
    category: 'ipad',
    specs: { chip: 'M5', display: '12.9" Liquid Retina XDR', storage: '128GB', connectivity: 'Wi-Fi' },
    prices: {
      apple: { price: 1199, inStock: true, url: 'https://apple.com/shop/buy-ipad/ipad-pro-13/MVX43LL/A' },
      amazon: { price: 1199, inStock: true, url: 'https://amazon.com/dp/B0CV77KLMP' },
      bestbuy: { price: 1199, inStock: true, url: 'https://bestbuy.com/site/apple-13-inch-ipad-pro-m5-chip-128gb-wifi-space-gray/6560125.p' },
      walmart: { price: 1199, inStock: true, url: 'https://walmart.com/ip/Apple-13-inch-iPad-Pro-M5-WiFi/976543212' },
      target: { price: 1199, inStock: true, url: 'https://target.com/p/apple-13-inch-ipad-pro-m5-wifi/-/A-89054323' },
      bh: { price: 1199, inStock: true, url: 'https://bhphotovideo.com/c/product/1802347-REG/apple_mvx43ll_a_13_ipad_pro_m5.html' },
      adorama: { price: 1199, inStock: true, url: 'https://www.adorama.com/search?query=iPad%20Pro%2013%20M5%20Wi-Fi' },
      cdw: { price: 1199, inStock: true, url: 'https://cdw.com/product/apple-13-inch-ipad-pro-m5-wifi/7390125' }
    }
  },
  {
    id: 'ipad-pro-11-m5-wifi',
    name: 'iPad Pro 11" M5 Wi-Fi',
    modelNumber: 'A3148',
    sku: 'MVV93LL/A',
    category: 'ipad',
    specs: { chip: 'M5', display: '11" Liquid Retina XDR', storage: '128GB', connectivity: 'Wi-Fi' },
    prices: {
      apple: { price: 899, inStock: true, url: 'https://apple.com/shop/buy-ipad/ipad-pro-11/MVV93LL/A' },
      amazon: { price: 899, inStock: true, url: 'https://amazon.com/dp/B0CV77KLMQ' },
      bestbuy: { price: 899, inStock: true, url: 'https://bestbuy.com/site/apple-11-inch-ipad-pro-m5-chip-128gb-wifi-space-gray/6560126.p' },
      walmart: { price: 899, inStock: true, url: 'https://walmart.com/ip/Apple-11-inch-iPad-Pro-M5-WiFi/976543213' },
      target: { price: 899, inStock: true, url: 'https://target.com/p/apple-11-inch-ipad-pro-m5-wifi/-/A-89054324' },
      bh: { price: 899, inStock: true, url: 'https://bhphotovideo.com/c/product/1802348-REG/apple_mvv93ll_a_11_ipad_pro_m5.html' },
      adorama: { price: 899, inStock: true, url: 'https://www.adorama.com/search?query=iPad%20Pro%2011%20M5%20Wi-Fi' },
      cdw: { price: 899, inStock: true, url: 'https://cdw.com/product/apple-11-inch-ipad-pro-m5-wifi/7390126' }
    }
  },
  {
    id: 'ipad-pro-13-m5-cellular',
    name: 'iPad Pro 13" M5 Wi-Fi + Cellular',
    modelNumber: 'A3149',
    sku: 'MVX53LL/A',
    category: 'ipad',
    specs: { chip: 'M5', display: '12.9" Liquid Retina XDR', storage: '128GB', connectivity: 'Wi-Fi + Cellular' },
    prices: {
      apple: { price: 1399, inStock: true, url: 'https://apple.com/shop/buy-ipad/ipad-pro-13/MVX53LL/A' },
      amazon: { price: 1399, inStock: true, url: 'https://amazon.com/dp/B0CV77KLMR' },
      bestbuy: { price: 1399, inStock: true, url: 'https://bestbuy.com/site/apple-13-inch-ipad-pro-m5-chip-128gb-wifi-cellular-space-gray/6560127.p' },
      walmart: { price: 1399, inStock: true, url: 'https://walmart.com/ip/Apple-13-inch-iPad-Pro-M5-WiFi-Cellular/976543214' },
      target: { price: 1399, inStock: true, url: 'https://target.com/p/apple-13-inch-ipad-pro-m5-wifi-cellular/-/A-89054325' },
      bh: { price: 1399, inStock: true, url: 'https://bhphotovideo.com/c/product/1802349-REG/apple_mvx53ll_a_13_ipad_pro_m5.html' },
      adorama: { price: 1399, inStock: true, url: 'https://www.adorama.com/search?query=iPad%20Pro%2013%20M5%20Wi-Fi%20%2B%20Cellular' },
      cdw: { price: 1399, inStock: true, url: 'https://cdw.com/product/apple-13-inch-ipad-pro-m5-wifi-cellular/7390127' }
    }
  },
  {
    id: 'ipad-pro-11-m5-cellular',
    name: 'iPad Pro 11" M5 Wi-Fi + Cellular',
    modelNumber: 'A3150',
    sku: 'MVVA3LL/A',
    category: 'ipad',
    specs: { chip: 'M5', display: '11" Liquid Retina XDR', storage: '128GB', connectivity: 'Wi-Fi + Cellular' },
    prices: {
      apple: { price: 1099, inStock: true, url: 'https://apple.com/shop/buy-ipad/ipad-pro-11/MVVA3LL/A' },
      amazon: { price: 1099, inStock: true, url: 'https://amazon.com/dp/B0CV77KLMS' },
      bestbuy: { price: 1099, inStock: true, url: 'https://bestbuy.com/site/apple-11-inch-ipad-pro-m5-chip-128gb-wifi-cellular-space-gray/6560128.p' },
      walmart: { price: 1099, inStock: true, url: 'https://walmart.com/ip/Apple-11-inch-iPad-Pro-M5-WiFi-Cellular/976543215' },
      target: { price: 1099, inStock: true, url: 'https://target.com/p/apple-11-inch-ipad-pro-m5-wifi-cellular/-/A-89054326' },
      bh: { price: 1099, inStock: true, url: 'https://bhphotovideo.com/c/product/1802350-REG/apple_mvva3ll_a_11_ipad_pro_m5.html' },
      adorama: { price: 1099, inStock: true, url: 'https://www.adorama.com/search?query=iPad%20Pro%2011%20M5%20Wi-Fi%20%2B%20Cellular' },
      cdw: { price: 1099, inStock: true, url: 'https://cdw.com/product/apple-11-inch-ipad-pro-m5-wifi-cellular/7390128' }
    }
  },
  {
    id: 'ipad-air-13-m3',
    name: 'iPad Air 13" M3',
    modelNumber: 'A3151',
    sku: 'MV2C3LL/A',
    category: 'ipad',
    specs: { chip: 'M3', display: '12.9" Liquid Retina', storage: '128GB', connectivity: 'Wi-Fi' },
    prices: {
      apple: { price: 899, inStock: true, url: 'https://apple.com/shop/buy-ipad/ipad-air/MV2C3LL/A' },
      amazon: { price: 899, inStock: true, url: 'https://amazon.com/dp/B0CV77KLMT' },
      bestbuy: { price: 899, inStock: true, url: 'https://bestbuy.com/site/apple-13-inch-ipad-air-m3-chip-128gb-wifi-space-gray/6560129.p' },
      walmart: { price: 899, inStock: true, url: 'https://walmart.com/ip/Apple-13-inch-iPad-Air-M3-WiFi/976543216' },
      target: { price: 899, inStock: true, url: 'https://target.com/p/apple-13-inch-ipad-air-m3/-/A-89054327' },
      bh: { price: 899, inStock: true, url: 'https://bhphotovideo.com/c/product/1802351-REG/apple_mv2c3ll_a_13_ipad_air_m3.html' },
      adorama: { price: 899, inStock: true, url: 'https://www.adorama.com/search?query=iPad%20Air%2013%20M3' },
      cdw: { price: 899, inStock: true, url: 'https://cdw.com/product/apple-13-inch-ipad-air-m3/7390129' }
    }
  },
  {
    id: 'ipad-air-13-m3-cellular',
    name: 'iPad Air 13" M3 Wi-Fi + Cellular',
    modelNumber: 'A3152',
    sku: 'MV2D3LL/A',
    category: 'ipad',
    specs: { chip: 'M3', display: '12.9" Liquid Retina', storage: '128GB', connectivity: 'Wi-Fi + Cellular' },
    prices: {
      apple: { price: 1099, inStock: true, url: 'https://apple.com/shop/buy-ipad/ipad-air/MV2D3LL/A' },
      amazon: { price: 1099, inStock: true, url: 'https://amazon.com/dp/B0CV77KLMU' },
      bestbuy: { price: 1099, inStock: true, url: 'https://bestbuy.com/site/apple-13-inch-ipad-air-m3-chip-128gb-wifi-cellular-space-gray/6560130.p' },
      walmart: { price: 1099, inStock: true, url: 'https://walmart.com/ip/Apple-13-inch-iPad-Air-M3-WiFi-Cellular/976543217' },
      target: { price: 1099, inStock: true, url: 'https://target.com/p/apple-13-inch-ipad-air-m3-cellular/-/A-89054328' },
      bh: { price: 1099, inStock: true, url: 'https://bhphotovideo.com/c/product/1802352-REG/apple_mv2d3ll_a_13_ipad_air_m3.html' },
      adorama: { price: 1099, inStock: true, url: 'https://www.adorama.com/search?query=iPad%20Air%2013%20M3%20Wi-Fi%20%2B%20Cellular' },
      cdw: { price: 1099, inStock: true, url: 'https://cdw.com/product/apple-13-inch-ipad-air-m3-cellular/7390130' }
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