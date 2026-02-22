import pg from 'pg';
const { Pool } = pg;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize price history table
export async function initPriceHistoryTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_history (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(100) NOT NULL,
        retailer VARCHAR(50) NOT NULL,
        price INTEGER NOT NULL,
        in_stock BOOLEAN DEFAULT true,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, retailer, recorded_at)
      );
      
      CREATE INDEX IF NOT EXISTS idx_price_history_product 
        ON price_history(product_id);
      
      CREATE INDEX IF NOT EXISTS idx_price_history_retailer 
        ON price_history(retailer);
      
      CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at 
        ON price_history(recorded_at DESC);
        
      CREATE INDEX IF NOT EXISTS idx_price_history_product_retailer 
        ON price_history(product_id, retailer, recorded_at DESC);
    `);
    console.log('✅ Price history table initialized');
  } catch (err) {
    console.error('❌ Failed to init price history table:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Record a price snapshot
export async function recordPrice(productId, retailer, price, inStock = true) {
  try {
    await pool.query(
      `INSERT INTO price_history (product_id, retailer, price, in_stock)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id, retailer, recorded_at) 
       DO UPDATE SET price = $3, in_stock = $4`,
      [productId, retailer, price, inStock]
    );
  } catch (err) {
    console.error(`Failed to record price for ${productId}/${retailer}:`, err);
  }
}

// Get price history for a product (last N days)
export async function getPriceHistory(productId, days = 90) {
  try {
    const result = await pool.query(
      `SELECT retailer, price, in_stock, recorded_at
       FROM price_history
       WHERE product_id = $1 
         AND recorded_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
       ORDER BY recorded_at DESC`,
      [productId]
    );
    return result.rows;
  } catch (err) {
    console.error(`Failed to get price history for ${productId}:`, err);
    return [];
  }
}

// Get price history for specific retailer
export async function getRetailerPriceHistory(productId, retailer, days = 90) {
  try {
    const result = await pool.query(
      `SELECT price, in_stock, recorded_at
       FROM price_history
       WHERE product_id = $1 
         AND retailer = $2
         AND recorded_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
       ORDER BY recorded_at ASC`,
      [productId, retailer]
    );
    return result.rows;
  } catch (err) {
    console.error(`Failed to get price history for ${productId}/${retailer}:`, err);
    return [];
  }
}

// Get latest prices for all products (for comparison)
export async function getLatestPrices() {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (product_id, retailer)
        product_id, retailer, price, in_stock, recorded_at
      FROM price_history
      ORDER BY product_id, retailer, recorded_at DESC
    `);
    return result.rows;
  } catch (err) {
    console.error('Failed to get latest prices:', err);
    return [];
  }
}

// Get price drops (prices that decreased since last check)
export async function getPriceDrops(threshold = 0.05) {
  try {
    const result = await pool.query(`
      WITH latest_prices AS (
        SELECT DISTINCT ON (product_id, retailer)
          product_id, retailer, price, recorded_at
        FROM price_history
        ORDER BY product_id, retailer, recorded_at DESC
      ),
      previous_prices AS (
        SELECT DISTINCT ON (product_id, retailer)
          product_id, retailer, price as prev_price
        FROM price_history
        WHERE (product_id, retailer, recorded_at) NOT IN (
          SELECT product_id, retailer, recorded_at FROM latest_prices
        )
        ORDER BY product_id, retailer, recorded_at DESC
      )
      SELECT 
        l.product_id,
        l.retailer,
        l.price as new_price,
        p.prev_price,
        ((p.prev_price - l.price)::float / p.prev_price) as drop_percentage
      FROM latest_prices l
      JOIN previous_prices p ON l.product_id = p.product_id AND l.retailer = p.retailer
      WHERE l.price < p.prev_price * (1 - $1)
    `, [threshold]);
    return result.rows;
  } catch (err) {
    console.error('Failed to get price drops:', err);
    return [];
  }
}

// Get inventory changes (items coming back in stock)
export async function getInventoryChanges() {
  try {
    const result = await pool.query(`
      WITH latest_status AS (
        SELECT DISTINCT ON (product_id, retailer)
          product_id, retailer, in_stock, recorded_at
        FROM price_history
        ORDER BY product_id, retailer, recorded_at DESC
      ),
      previous_status AS (
        SELECT DISTINCT ON (product_id, retailer)
          product_id, retailer, in_stock as was_in_stock
        FROM price_history
        WHERE (product_id, retailer, recorded_at) NOT IN (
          SELECT product_id, retailer, recorded_at FROM latest_status
        )
        ORDER BY product_id, retailer, recorded_at DESC
      )
      SELECT 
        l.product_id,
        l.retailer,
        l.in_stock as now_in_stock
      FROM latest_status l
      JOIN previous_status p ON l.product_id = p.product_id AND l.retailer = p.retailer
      WHERE l.in_stock = true AND p.was_in_stock = false
    `);
    return result.rows;
  } catch (err) {
    console.error('Failed to get inventory changes:', err);
    return [];
  }
}

// Clean up old data (keep 1 year)
export async function cleanupOldData() {
  try {
    await pool.query(`
      DELETE FROM price_history 
      WHERE recorded_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
    `);
    console.log('✅ Cleaned up old price history data');
  } catch (err) {
    console.error('Failed to cleanup old data:', err);
  }
}

export { pool };