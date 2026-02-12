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
  userId: integer("userId").references(() => users.id),
  createdAt: text("createdAt").default(new Date().toISOString()),
});

// Users schema for authentication
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("cashier"), // 'admin' or 'cashier'
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
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
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
} catch (err) {
  console.error("Migration error:", err);
}

const bcrypt = require("bcryptjs");

// Create default admin if none exists
const adminExists = db.prepare(`SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'`).get();
if (adminExists.cnt === 0) {
  // Hash the default password securely
  const defaultPassword = "admin123";
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

  db.prepare(`
    INSERT INTO users (username, password, role)
    VALUES (?, ?, ?)
  `).run("admin", hashedPassword, "admin");
  console.log("✓ Default admin created - username: admin, password: admin123 (hashed)");
}

const orm = drizzle(db);

module.exports = { db, orm, products, orders, users };
