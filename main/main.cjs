const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { db, orm, products, orders } = require("./db.cjs");
const bcrypt = require("bcryptjs");

let mainWindow;
let currentUser = null; // Store current logged-in user

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

// ===== AUTH HANDLERS =====

// Login handler
ipcMain.handle("auth:login", async (_, { username, password }) => {
  try {
    const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);

    if (!user) {
      return { success: false, message: "Invalid username or password" };
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: "Invalid username or password" };
    }

    currentUser = { id: user.id, username: user.username, role: user.role };
    return { success: true, user: currentUser };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, message: "Login failed" };
  }
});

// Logout handler
ipcMain.handle("auth:logout", () => {
  currentUser = null;
  return { success: true };
});

// Get current user
ipcMain.handle("auth:getCurrentUser", () => {
  return currentUser;
});

// Update user profile
ipcMain.handle("auth:updateProfile", async (_, { currentPassword, newUsername, newPassword }) => {
  try {
    if (!currentUser) {
      return { success: false, message: "Not logged in" };
    }

    // Verify current password
    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(currentUser.id);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return { success: false, message: "Incorrect current password" };
    }

    // Update fields
    const updates = [];
    const params = [];

    if (newUsername) {
      // Check if username is taken by another user
      const exists = db.prepare(`SELECT * FROM users WHERE username = ? AND id != ?`).get(newUsername, currentUser.id);
      if (exists) {
        return { success: false, message: "Username already taken" };
      }
      updates.push("username = ?");
      params.push(newUsername);
      currentUser.username = newUsername; // Update session
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push("password = ?");
      params.push(hashedPassword);
    }

    if (updates.length > 0) {
      params.push(currentUser.id);
      db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }

    return { success: true, message: "Profile updated successfully", user: currentUser };
  } catch (err) {
    console.error("Update profile error:", err);
    return { success: false, message: "Failed to update profile" };
  }
});

// Register cashier (admin only)
ipcMain.handle("auth:registerCashier", async (_, { username, password }) => {
  try {
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, message: "Unauthorized - admin only" };
    }

    // Check if username already exists
    const exists = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
    if (exists) {
      return { success: false, message: "Username already exists" };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new cashier
    db.prepare(`
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `).run(username, hashedPassword, "cashier");

    return { success: true, message: `Cashier '${username}' created successfully` };
  } catch (err) {
    console.error("Register error:", err);
    return { success: false, message: "Registration failed" };
  }
});

// Get all cashiers (admin only)
ipcMain.handle("auth:getCashiers", () => {
  try {
    if (!currentUser || currentUser.role !== "admin") {
      return [];
    }
    const cashiers = db.prepare(`SELECT id, username, role, createdAt FROM users WHERE role = 'cashier'`).all();
    return cashiers;
  } catch (err) {
    console.error("Error fetching cashiers:", err);
    return [];
  }
});

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
      return [];
    }

    query = query.trim();

    // If query is only numbers → treat as barcode (exact match)
    const isBarcode = /^[0-9]+$/.test(query);

    let results;

    if (isBarcode) {
      results = db.prepare(`
        SELECT * FROM products 
        WHERE barcode = ?
      `).all(query);
    } else {
      results = db.prepare(`
        SELECT * FROM products 
        WHERE name LIKE ?
        ORDER BY name ASC
        LIMIT 10
      `).all(`%${query}%`);
    }

    return results || [];
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

// Update product (admin only) – all attributes
ipcMain.handle("medicine:update", (_, data) => {
  try {
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized - admin only");
    }
    if (!data.id) {
      throw new Error("Invalid data: id required");
    }

    db.prepare(`
      UPDATE products SET
        name = ?, barcode = ?, category = ?, quantity = ?,
        purchasePrice = ?, salePrice = ?, description = ?
      WHERE id = ?
    `).run(
      data.name ?? "",
      data.barcode ?? "",
      data.category ?? "",
      data.quantity ?? 0,
      String(data.purchasePrice ?? "0"),
      String(data.salePrice ?? "0"),
      data.description ?? "",
      data.id
    );

    return true;
  } catch (err) {
    console.error("Error updating product:", err);
    throw err;
  }
});

// Delete product (admin only)
ipcMain.handle("medicine:delete", (_, id) => {
  try {
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized - admin only");
    }
    if (!id) {
      throw new Error("Invalid data: id required");
    }

    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return true;
  } catch (err) {
    console.error("Error deleting product:", err);
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

    const isRefund = parseFloat(data.total) < 0;

    // Validate stock only for positive transactions
    if (!isRefund) {
      for (const item of data.items) {
        if (!item.id || !item.quantity) {
          return { success: false, message: `Invalid item data for ${item.name || item.id}` };
        }

        const prod = db.prepare(`SELECT quantity, name FROM products WHERE id = ?`).get(item.id);
        const available = prod ? Number(prod.quantity) : 0;
        if (available < item.quantity) {
          return { success: false, message: `Insufficient stock for ${prod?.name || item.name || item.id}: requested ${item.quantity}, available ${available}` };
        }
      }
    }

    // Insert order
    const orderResult = db.prepare(`
      INSERT INTO orders (items, total, createdAt)
      VALUES (?, ?, ?)
    `).run(JSON.stringify(data.items), data.total.toString(), new Date().toISOString());

    // Update stock for each item (negative quantities add stock back for refunds)
    data.items.forEach((item) => {
      try {
        db.prepare(`
          UPDATE products 
          SET quantity = quantity - ? 
          WHERE id = ?
        `).run(item.quantity, item.id);
      } catch (err) {
        console.error("Error updating stock for item:", item, err);
      }
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

    // Handle both string period and object with {period, year, month}
    let period = typeof params === "string" ? params : params.period;
    const customYear = typeof params === "object" ? params.year : null;
    const customMonth = typeof params === "object" ? params.month : null; // 0-indexed or 1-indexed? Let's assume passed as 0-11 for consistency with Date

    // Calculate date range based on period
    if (period === "daily") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === "yearly") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (period === "custom-year" && customYear) {
      startDate = new Date(customYear, 0, 1);
      endDate = new Date(customYear, 11, 31, 23, 59, 59, 999);
    } else if (period === "custom-month" && customYear && customMonth !== undefined) {
      startDate = new Date(customYear, customMonth, 1);
      endDate = new Date(customYear, customMonth + 1, 0, 23, 59, 59, 999);
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
        items: items, // Include full items for display
        createdAt: order.createdAt,
      });
    });

    recentOrders = recentOrders.slice(-20).reverse(); // Increased limit to 20 just in case

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
        totalRevenue: Math.round(totalRevenue),
        totalCost: Math.round(totalCost),
        profit: Math.round(totalRevenue - totalCost),
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
