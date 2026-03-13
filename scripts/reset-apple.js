// Reset all Apple retailer entries to verified: false
import fs from 'fs';

const stockData = JSON.parse(fs.readFileSync('stock-data.json', 'utf-8'));

let appleResetCount = 0;

for (const [productId, retailers] of Object.entries(stockData.products)) {
  if (retailers.apple) {
    // Keep the inStock value but mark as unverified
    retailers.apple.verified = false;
    appleResetCount++;
  }
}

// Update timestamp
stockData.generated = new Date().toISOString();
stockData.note = 'Apple entries reset to unverified due to incorrect stock checker data';

fs.writeFileSync('stock-data.json', JSON.stringify(stockData, null, 2));

console.log(`✅ Reset ${appleResetCount} Apple entries to verified: false`);
console.log('Stock data saved. Backend will now use hardcoded values for Apple.');