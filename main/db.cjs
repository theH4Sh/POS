const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const { sqliteTable, integer, text } = require("drizzle-orm/sqlite-core");

// Create database
const db = new Database("pharmacy.db");

// Create table (IMPORTANT)
db.prepare(`
  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    purchase_price INTEGER NOT NULL,
    sale_price INTEGER NOT NULL
  )
`).run();

const orm = drizzle(db);

// Drizzle schema
const medicines = sqliteTable("medicines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  purchasePrice: integer("purchase_price").notNull(),
  salePrice: integer("sale_price").notNull(),
});

module.exports = { orm, medicines };
