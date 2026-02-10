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

// Get dashboard statistics
ipcMain.handle("getDashboardStats", (_, params = "monthly") => {
  try {
    const now = new Date();
    let startDate, endDate;
    
    // Handle both string period and object with {period, year}
    let period = typeof params === "string" ? params : params.period;
    const customYear = typeof params === "object" ? params.year : null;

    // Calculate date range based on period
    if (period === "daily") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (period === "yearly") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (period === "custom-year" && customYear) {
      startDate = new Date(customYear, 0, 1);
      endDate = new Date(customYear, 11, 31, 23, 59, 59, 999);
    } else {
      // overall - no date filter
      startDate = new Date(0);
      endDate = new Date();
    }

    // Get all products
    const products = db.prepare(`SELECT * FROM products`).all();

    // Get orders within date range
    let orders = db.prepare(`SELECT * FROM orders`).all();
    
    if (period !== "overall") {
      orders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Calculate stats
    let totalRevenue = 0;
    let totalCost = 0;
    let totalOrders = orders.length;
    let recentOrders = [];

    orders.forEach((order) => {
      const items = JSON.parse(order.items || '[]');
      totalRevenue += parseFloat(order.total || 0);

      items.forEach((item) => {
        totalCost += parseFloat(item.purchasePrice || 0) * item.quantity;
      });

      recentOrders.push({
        id: order.id,
        total: order.total,
        itemCount: items.length,
        createdAt: order.createdAt,
      });
    });

    recentOrders = recentOrders.slice(-10).reverse();

    // Get top products by sales
    const productSales = {};
    orders.forEach((order) => {
      const items = JSON.parse(order.items || '[]');
      items.forEach((item) => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            name: item.name,
            category: item.category,
            orders: 0,
            revenue: 0,
          };
        }
        productSales[item.id].orders += 1;
        productSales[item.id].revenue += parseFloat(item.salePrice) * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get low stock products (always overall, not period-specific)
    const lowStockCount = products.filter((p) => p.quantity < 20).length;

    return {
      stats: {
        totalRevenue: totalRevenue.toFixed(2),
        totalCost: totalCost.toFixed(2),
        profit: (totalRevenue - totalCost).toFixed(2),
        totalOrders,
        totalProducts: products.length,
        lowStockCount,
      },
      topProducts,
      recentOrders,
    };
  } catch (err) {
    console.error("Error getting dashboard stats:", err);
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
