const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const { sqliteTable, integer, text } = require("drizzle-orm/sqlite-core"); // remove json()

const db = new Database("pharmacy.db");

// Drizzle schema
const medicines = sqliteTable("medicines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  barcode: text("barcode"),
  tabletsPerStrip: integer("tablets_per_strip").notNull().default(1),
  stripsPerBox: integer("strips_per_box").notNull().default(1),
  stockTablets: integer("stock_tablets").notNull().default(0),
  purchasePriceBox: integer("purchase_price_box").notNull().default(0),
  prices: text("prices").notNull().default('{"tablet":0,"strip":0,"box":0}'), // store as string
  description: text("description").default(""),
});

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    barcode TEXT,
    tablets_per_strip INTEGER NOT NULL DEFAULT 1,
    strips_per_box INTEGER NOT NULL DEFAULT 1,
    stock_tablets INTEGER NOT NULL DEFAULT 0,
    purchase_price_box INTEGER NOT NULL DEFAULT 0,
    prices TEXT NOT NULL DEFAULT '{"tablet":0,"strip":0,"box":0}',
    description TEXT DEFAULT ''
  )
`).run();

const orm = drizzle(db);

module.exports = { orm, medicines };