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

const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  items: text("items").notNull(),
  total: text("total").notNull(),
  userId: integer("userId").references(() => users.id),
  discount: integer("discount").default(0),
  createdAt: text("createdAt").default(new Date().toISOString()),
});

// Settings schema
const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
});

// Users schema for authentication
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("cashier"), // 'admin' or 'cashier'
  isRevoked: integer("isRevoked").notNull().default(0), // 0 = active, 1 = revoked
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
    userId INTEGER REFERENCES users(id),
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cashier',
    isRevoked INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  );

  -- Migration: Add userId to orders if it doesn't exist
  PRAGMA foreign_keys=OFF;
  BEGIN TRANSACTION;
  SELECT name FROM sqlite_master WHERE type='table' AND name='orders' AND sql LIKE '%userId%';
  -- The following logic is handled better in JS for better-sqlite3
  COMMIT;
  PRAGMA foreign_keys=ON;
`);

try {
  // Check if userId column exists in orders table
  const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
  const hasUserId = tableInfo.some(col => col.name === 'userId');

  if (!hasUserId) {
    db.prepare("ALTER TABLE orders ADD COLUMN userId INTEGER REFERENCES users(id)").run();
    console.log("✓ Migration: Added userId column to orders table");
  }
  // Ensure autoPrintCheckout setting exists
  const autoPrintExists = db.prepare("SELECT 1 FROM settings WHERE key = ?").get("autoPrintCheckout");
  if (!autoPrintExists) {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("autoPrintCheckout", "false");
    console.log("✓ Migration: Initialized autoPrintCheckout setting");
  }

  // Check if discount column exists in orders table
  const hasDiscount = tableInfo.some(col => col.name === 'discount');
  if (!hasDiscount) {
    db.prepare("ALTER TABLE orders ADD COLUMN discount INTEGER DEFAULT 0").run();
    console.log("✓ Migration: Added discount column to orders table");
  }
  // Check if isRevoked column exists in users table
  const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasIsRevoked = userTableInfo.some(col => col.name === 'isRevoked');

  if (!hasIsRevoked) {
    db.prepare("ALTER TABLE users ADD COLUMN isRevoked INTEGER NOT NULL DEFAULT 0").run();
    console.log("✓ Migration: Added isRevoked column to users table");
  }
} catch (err) {
  console.error("Migration error:", err);
}

const bcrypt = require("bcryptjs");

// Default admin creation removed. Admin must be registered via the Setup flow.

const orm = drizzle(db);

module.exports = { db, orm, products, orders, users, settings };
