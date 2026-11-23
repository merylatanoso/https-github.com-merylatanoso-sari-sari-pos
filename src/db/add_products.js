require('dotenv').config();
const { query, pool } = require('../config/db');

const PRODUCTS = [
  { name: 'Lucky Me Pancit Canton', barcode: '1001', category: 'Snacks', unit: 'pack', cost: 10, price: 14, stock: 50, reorder: 10 },
  { name: 'Piattos (small)', barcode: '1002', category: 'Snacks', unit: 'pack', cost: 12, price: 15, stock: 30, reorder: 8 },
  { name: 'Skyflakes (pack)', barcode: '1003', category: 'Snacks', unit: 'pack', cost: 7, price: 10, stock: 40, reorder: 10 },
  { name: 'Chippy', barcode: '1004', category: 'Snacks', unit: 'pack', cost: 8, price: 10, stock: 40, reorder: 10 },
  { name: 'Coke Mismo', barcode: '1005', category: 'Beverages', unit: 'bottle', cost: 15, price: 20, stock: 24, reorder: 6 },
  { name: 'Milo (sachet)', barcode: '1006', category: 'Beverages', unit: 'pc', cost: 6, price: 8, stock: 60, reorder: 15 },
  { name: 'Nescafe 3-in-1', barcode: '1007', category: 'Beverages', unit: 'pc', cost: 5, price: 7, stock: 80, reorder: 20 },
  { name: 'Bottled Water 500ml', barcode: '1008', category: 'Beverages', unit: 'bottle', cost: 10, price: 15, stock: 30, reorder: 8 },
  { name: 'Safeguard (small)', barcode: '1009', category: 'Household', unit: 'pc', cost: 25, price: 32, stock: 15, reorder: 5 },
  { name: 'Surf Powder (sachet)', barcode: '1010', category: 'Household', unit: 'pc', cost: 6, price: 8, stock: 50, reorder: 12 },
  { name: 'Colgate (sachet)', barcode: '1011', category: 'Household', unit: 'pc', cost: 5, price: 7, stock: 40, reorder: 10 },
];

async function categoryId(name) {
  await query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
  const { rows } = await query('SELECT id FROM categories WHERE name = $1', [name]);
  return rows[0].id;
}

async function main() {
  let added = 0, skipped = 0;
  for (const p of PRODUCTS) {
    const exists = await query('SELECT id FROM products WHERE name = $1 OR barcode = $2', [p.name, p.barcode]);
    if (exists.rows.length) { skipped++; continue; }
    const catId = await categoryId(p.category);
    await query(
      `INSERT INTO products (name, barcode, category_id, unit, cost_price, selling_price, stock_quantity, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [p.name, p.barcode, catId, p.unit, p.cost, p.price, p.stock, p.reorder]
    );
    added++;
    console.log('Added: ' + p.name);
  }
  console.log('Tapos na. Nadagdag: ' + added + ', nilaktawan: ' + skipped);
  await pool.end();
}

main().catch((err) => { console.error(err); process.exit(1); });