const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const { sqliteTable, integer, text } = require("drizzle-orm/sqlite-core"); // remove json()

const db = new Database("pharmacy.db");

// Drizzle schema
const medicines = sqliteTable("medicines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  barcode: text("barcode"),
  type: text("type").default(""), // new field for medicine type
  quantity: integer("quantity").notNull().default(0),
  price: text("price").notNull().default("0"), // store as string
  description: text("description").default(""),
});

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    barcode TEXT,
    type TEXT DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 0,
    price TEXT NOT NULL DEFAULT '0',
    description TEXT DEFAULT ''
  )
`).run();

const orm = drizzle(db);

module.exports = { orm, medicines };