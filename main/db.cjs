const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const { sqliteTable, integer, text } = require("drizzle-orm/sqlite-core");

// Step 1: Determine writable path for DB
const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "pharmacy.db");

// Step 2: Copy default DB if it doesn't exist yet
const defaultDbPath = path.join(__dirname, "../pharmacy.db"); // optional pre-filled DB in main/
if (!fs.existsSync(dbPath) && fs.existsSync(defaultDbPath)) {
  fs.copyFileSync(defaultDbPath, dbPath);
  console.log("✓ Default database copied to userData folder");
}

// Step 3: Initialize better-sqlite3 with writable path
const db = new Database(dbPath, { verbose: console.log });

// Step 4: Define schema using Drizzle ORM
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

const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
});

const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("cashier"),
  isRevoked: integer("isRevoked").notNull().default(0),
  createdAt: text("createdAt").default(new Date().toISOString()),
});

// Step 5: Ensure tables and migrations
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
    discount INTEGER DEFAULT 0,
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
`);

try {
  // Add missing columns for migrations if needed
  const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
  if (!tableInfo.some(c => c.name === "discount")) {
    db.prepare("ALTER TABLE orders ADD COLUMN discount INTEGER DEFAULT 0").run();
    console.log("✓ Migration: Added discount column to orders table");
  }

  const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
  if (!userTableInfo.some(c => c.name === "isRevoked")) {
    db.prepare("ALTER TABLE users ADD COLUMN isRevoked INTEGER NOT NULL DEFAULT 0").run();
    console.log("✓ Migration: Added isRevoked column to users table");
  }

  // Ensure default settings exist
  const autoPrintExists = db.prepare("SELECT 1 FROM settings WHERE key=?").get("autoPrintCheckout");
  if (!autoPrintExists) {
    db.prepare("INSERT INTO settings (key,value) VALUES (?,?)").run("autoPrintCheckout", "false");
    console.log("✓ Migration: Initialized autoPrintCheckout setting");
  }
} catch (err) {
  console.error("Migration error:", err);
}

// Step 6: Initialize ORM
const orm = drizzle(db);

module.exports = { db, orm, products, orders, users, settings };
