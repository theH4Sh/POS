const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const { sqliteTable, integer, text } = require("drizzle-orm/sqlite-core");

const db = new Database("pharmacy.db");

// Products/Medicines schema
const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  barcode: text("barcode"),
  category: text("category").default(""),
  quantity: integer("quantity").notNull().default(0),
  purchasePrice: text("purchasePrice").notNull().default("0"),
  salePrice: text("salePrice").notNull().default("0"),
  description: text("description").default(""),
});

// Orders schema
const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  items: text("items").notNull(),
  total: text("total").notNull(),
  createdAt: text("createdAt").default(new Date().toISOString()),
});

// Create tables if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    barcode TEXT,
    category TEXT DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 0,
    purchasePrice TEXT NOT NULL DEFAULT '0',
    salePrice TEXT NOT NULL DEFAULT '0',
    description TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT NOT NULL,
    total TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const orm = drizzle(db);

module.exports = { db, orm, products, orders };