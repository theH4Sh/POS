const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { db, orm, products, orders } = require("./db.cjs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL("http://localhost:5173");
  mainWindow.webContents.openDevTools(); // For debugging
}

// ===== REGISTER ALL HANDLERS FIRST =====

// Add product
ipcMain.handle("medicine:add", (_, data) => {
  try {
    db.prepare(`
      INSERT INTO products (name, barcode, category, quantity, purchasePrice, salePrice, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(data.name, data.barcode, data.category, data.quantity, data.purchasePrice, data.salePrice, data.description);
    return true;
  } catch (err) {
    console.error("Error adding product:", err);
    throw err;
  }
});

// List all products
ipcMain.handle("medicine:list", () => {
  try {
    const result = db.prepare(`SELECT * FROM products`).all();
    return result || [];
  } catch (err) {
    console.error("Error listing products:", err);
    return [];
  }
});

// Search product by barcode or name
ipcMain.handle("medicine:search", (_, query) => {
  try {
    if (!query || query.trim() === "") {
      console.log("Empty query provided");
      return null;
    }
    
    console.log("Searching for:", query);
    
    const result = db.prepare(`
      SELECT * FROM products 
      WHERE name LIKE ? OR barcode LIKE ?
      LIMIT 1
    `).get(`%${query}%`, `%${query}%`);
    
    console.log("Search result:", result);
    return result || null;
  } catch (err) {
    console.error("Error searching product:", err);
    throw err;
  }
});

// Update stock
ipcMain.handle("medicine:updateStock", (_, data) => {
  try {
    if (!data.id || data.quantity === undefined) {
      throw new Error("Invalid data: id and quantity required");
    }
    
    db.prepare(`
      UPDATE products SET quantity = ? WHERE id = ?
    `).run(data.quantity, data.id);
    
    return true;
  } catch (err) {
    console.error("Error updating stock:", err);
    throw err;
  }
});

// Get low stock alerts
ipcMain.handle("medicine:lowStock", () => {
  try {
    const result = db.prepare(`
      SELECT * FROM products 
      WHERE quantity < 20 
      ORDER BY quantity ASC
    `).all();
    
    return result || [];
  } catch (err) {
    console.error("Error getting low stock:", err);
    return [];
  }
});

// Create order
ipcMain.handle("order:create", (_, data) => {
  try {
    if (!data.items || !data.total) {
      throw new Error("Invalid data: items and total required");
    }

    // Insert order
    const orderResult = db.prepare(`
      INSERT INTO orders (items, total, createdAt)
      VALUES (?, ?, ?)
    `).run(JSON.stringify(data.items), data.total.toString(), new Date().toISOString());

    // Update stock for each item
    data.items.forEach((item) => {
      if (!item.id || !item.quantity) {
        console.warn("Invalid item data:", item);
        return;
      }

      db.prepare(`
        UPDATE products 
        SET quantity = quantity - ? 
        WHERE id = ?
      `).run(item.quantity, item.id);
    });

    return { success: true, orderId: orderResult.lastInsertRowid };
  } catch (err) {
    console.error("Error creating order:", err);
    throw err;
  }
});

// ===== START APP AFTER HANDLERS ARE REGISTERED =====

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
