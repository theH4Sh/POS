const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { db, orm, products, orders } = require("./db.cjs");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");

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

  mainWindow.removeMenu();
  mainWindow.maximize()
  mainWindow.loadURL("http://localhost:5173");
}

// ===== REGISTER ALL HANDLERS FIRST =====

// ===== SYSTEM STATUS & SETUP HANDLERS =====

// Check if system needs setup (no admin exists)
ipcMain.handle("auth:checkSystemStatus", () => {
  try {
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count;
    return { hasAdmin: adminCount > 0 };
  } catch (err) {
    console.error("Error checking system status:", err);
    return { hasAdmin: false }; // Fail safe? Or true to prevent setup? False allows setup which might be safer if DB is corrupt but we want valid state.
  }
});

// Register the FIRST admin (Setup flow)
ipcMain.handle("auth:registerAdmin", async (_, { username, password }) => {
  try {
    // SECURITY CHECK: verified again that no admin exists
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count;
    if (adminCount > 0) {
      return { success: false, message: "System already setup. Admin exists." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin
    const info = db.prepare(`
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `).run(username, hashedPassword, "admin");

    // Automatically log them in
    currentUser = { id: info.lastInsertRowid, username, role: "admin" };

    return { success: true, user: currentUser };
  } catch (err) {
    console.error("Setup error:", err);
    return { success: false, message: "Setup failed: " + err.message };
  }
});

// ===== AUTH HANDLERS =====

// Login handler
ipcMain.handle("auth:login", async (_, { username, password }) => {
  try {
    const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);

    if (!user) {
      return { success: false, message: "Invalid username or password" };
    }

    if (user.isRevoked) {
      return { success: false, message: "Account has been revoked. Please contact administrator." };
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: "Invalid username or password" };
    }

    currentUser = { id: user.id, username: user.username, role: user.role };
    console.log("✓ Login Success - Global currentUser set to:", currentUser);
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
  console.log("Session Check: currentUser is currently", currentUser?.username || "NULL");
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

// Settings Handlers
ipcMain.handle("settings:get", () => {
  try {
    const allSettings = db.prepare("SELECT key, value FROM settings").all();
    const settingsMap = {};
    allSettings.forEach(s => {
      settingsMap[s.key] = s.value === 'true' ? true : s.value === 'false' ? false : s.value;
    });
    return settingsMap;
  } catch (err) {
    console.error("Error getting settings:", err);
    return {};
  }
});

ipcMain.handle("settings:update", (_, { key, value }) => {
  try {
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, message: "Unauthorized - admin only" };
    }
    const valStr = typeof value === 'boolean' ? String(value) : value;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, valStr);
    return { success: true };
  } catch (err) {
    console.error("Error updating setting:", err);
    return { success: false, message: err.message };
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
    const cashiers = db.prepare(`SELECT id, username, role, createdAt FROM users WHERE role = 'cashier' AND isRevoked = 0`).all();
    return cashiers;
  } catch (err) {
    console.error("Error fetching cashiers:", err);
    return [];
  }
});

// Delete cashier (admin only)
ipcMain.handle("auth:deleteCashier", async (_, id) => {
  try {
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, message: "Unauthorized - admin only" };
    }

    // Check if user exists and is a cashier
    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    if (user.role !== "cashier") {
      return { success: false, message: "Cannot delete administrators" };
    }

    db.prepare(`UPDATE users SET isRevoked = 1 WHERE id = ?`).run(id);
    return { success: true, message: `Account '${user.username}' revoked successfully` };
  } catch (err) {
    console.error("Delete cashier error:", err);
    return { success: false, message: "Failed to revoke access" };
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

    // Attribution logic
    const userId = data.operatorId || currentUser?.id || null;

    // Insert order
    console.log("Order Attribution Trace:");
    console.log("- Provided Operator ID (Frontend):", data.operatorId);
    console.log("- Global Current User ID (Backend):", currentUser?.id);
    console.log("- Final userId used for INSERT:", userId);

    const orderResult = db.prepare(`
      INSERT INTO orders (items, total, userId, discount, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(JSON.stringify(data.items), data.total.toString(), userId, data.discount || 0, new Date().toISOString());

    console.log("- Order ID Created:", orderResult.lastInsertRowid);

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

    // Get orders within date range (with user info)
    let orders = db.prepare(`
      SELECT o.*, u.username as processedBy, u.role as processorRole
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
    `).all();

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
        discount: order.discount || 0,
        itemCount: items.length,
        items: items, // Include full items for display
        createdAt: order.createdAt,
        processedBy: order.processedBy || "System",
        processorRole: order.processorRole || ""
      });
    });

    recentOrders = recentOrders.reverse(); // Return all orders for the period, reversed (newest first)

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

ipcMain.handle("orders:export", async (_, data) => {
  try {
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, message: "Unauthorized - admin only" };
    }

    const { orders: exportData } = data;
    if (!exportData || exportData.length === 0) {
      return { success: false, message: "No data to export" };
    }

    // Prepare Summary Sheet & Calculate Totals
    let totalRevenue = 0;
    let totalCost = 0;
    let totalDiscount = 0;

    const summaryData = exportData.map(order => {
      const orderTotal = parseFloat(order.total || 0);
      const orderDiscount = parseFloat(order.discount || 0);

      // Calculate order cost from items
      let orderCost = 0;
      order.items.forEach(item => {
        orderCost += parseFloat(item.purchasePrice || 0) * item.quantity;
      });

      totalRevenue += orderTotal;
      totalCost += orderCost;
      totalDiscount += orderDiscount;

      return {
        "Order ID": order.id,
        "Cashier": order.processedBy,
        "Role": order.processorRole,
        "Items Count": order.itemCount,
        "Order Cost": orderCost,
        "Discount": orderDiscount,
        "Final Total": orderTotal,
        "Profit/Loss": orderTotal - orderCost,
        "Date": new Date(order.createdAt).toLocaleDateString(),
        "Time": new Date(order.createdAt).toLocaleTimeString()
      };
    });

    // Prepare Itemized Sheet
    const itemizedData = [];
    exportData.forEach(order => {
      order.items.forEach(item => {
        const itemRevenue = item.salePrice * item.quantity;
        const itemCost = (parseFloat(item.purchasePrice) || 0) * item.quantity;
        itemizedData.push({
          "Order ID": order.id,
          "Product Name": item.name,
          "Category": item.category,
          "Quantity": item.quantity,
          "Unit Cost": item.purchasePrice,
          "Unit Sale": item.salePrice,
          "Total Cost": itemCost,
          "Total Sale": itemRevenue,
          "Item Profit": itemRevenue - itemCost,
          "Date": new Date(order.createdAt).toLocaleDateString()
        });
      });
    });

    // Prepare Financial Overview Sheet
    const financialOverview = [
      { "Metric": "Total Sales (Revenue)", "Value": totalRevenue },
      { "Metric": "Total Expenses (Cost of Goods)", "Value": totalCost },
      { "Metric": "Total Discounts Given", "Value": totalDiscount },
      { "Metric": "Net Profit/Loss", "Value": totalRevenue - totalCost },
      { "Metric": "Average Order Value", "Value": totalRevenue / exportData.length },
      { "Metric": "Total Orders Exported", "Value": exportData.length }
    ];

    const wb = XLSX.utils.book_new();
    const wsOverview = XLSX.utils.json_to_sheet(financialOverview);
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wsItemized = XLSX.utils.json_to_sheet(itemizedData);

    XLSX.utils.book_append_sheet(wb, wsOverview, "Financial Overview");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Orders Summary");
    XLSX.utils.book_append_sheet(wb, wsItemized, "Itemized Details");

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: "Export Analytics Data",
      defaultPath: path.join(app.getPath("documents"), `Pharmacy_Export_${new Date().toISOString().split('T')[0]}.xlsx`),
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }]
    });

    if (filePath) {
      XLSX.writeFile(wb, filePath);
      return { success: true, filePath };
    }
    return { success: false, message: "Export cancelled" };

  } catch (err) {
    console.error("Export error:", err);
    return { success: false, message: "Export failed: " + err.message };
  }
});

// Inventory Import/Export
ipcMain.handle("medicine:export", async () => {
  try {
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, message: "Unauthorized - admin only" };
    }

    const items = db.prepare("SELECT * FROM products").all();

    // Format for Excel
    const excelData = items.map(item => ({
      "ID": item.id,
      "Name": item.name,
      "Barcode": item.barcode || "",
      "Category": item.category || "others",
      "Quantity": item.quantity,
      "Purchase Price": item.purchasePrice,
      "Sale Price": item.salePrice,
      "Description": item.description || ""
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: "Export Product Inventory",
      defaultPath: path.join(app.getPath("documents"), `Inventory_Export_${new Date().toISOString().split('T')[0]}.xlsx`),
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }]
    });

    if (filePath) {
      XLSX.writeFile(wb, filePath);
      return { success: true, filePath };
    }
    return { success: false, message: "Export cancelled" };
  } catch (err) {
    console.error("Inventory export error:", err);
    return { success: false, message: "Export failed: " + err.message };
  }
});

ipcMain.handle("medicine:import", async () => {
  try {
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, message: "Unauthorized - admin only" };
    }

    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: "Import Product Inventory",
      filters: [{ name: "Excel Files", extensions: ["xlsx", "xls", "csv"] }],
      properties: ["openFile"]
    });

    if (!filePaths || filePaths.length === 0) {
      return { success: false, message: "Import cancelled" };
    }

    const workbook = XLSX.readFile(filePaths[0]);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let created = 0;
    let updated = 0;
    let errors = 0;

    const upsertStmt = db.prepare(`
      INSERT INTO products (id, name, barcode, category, quantity, purchasePrice, salePrice, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        barcode = excluded.barcode,
        category = excluded.category,
        quantity = excluded.quantity,
        purchasePrice = excluded.purchasePrice,
        salePrice = excluded.salePrice,
        description = excluded.description
    `);

    const findByNameBarcodeStmt = db.prepare(`
      SELECT id FROM products WHERE name = ? AND barcode = ?
    `);

    // Use a transaction for better performance
    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        try {
          const name = row["Name"] || row["name"];
          if (!name) continue;

          const id = row["ID"] || row["id"];
          const barcode = row["Barcode"] || row["barcode"] || "";
          const category = row["Category"] || row["category"] || "others";
          const quantity = parseInt(row["Quantity"] || row["quantity"] || 0);
          const purchasePrice = String(row["Purchase Price"] || row["purchasePrice"] || "0");
          const salePrice = String(row["Sale Price"] || row["salePrice"] || "0");
          const description = row["Description"] || row["description"] || "";

          let targetId = id;

          // If no ID, try to find existing by name and barcode
          if (!targetId) {
            const existing = findByNameBarcodeStmt.get(name, barcode);
            if (existing) {
              targetId = existing.id;
              updated++;
            } else {
              created++;
            }
          } else {
            // Check if ID exists to increment updated/created counts correctly
            const exists = db.prepare("SELECT 1 FROM products WHERE id = ?").get(targetId);
            if (exists) updated++; else created++;
          }

          upsertStmt.run(targetId || null, name, barcode, category, quantity, purchasePrice, salePrice, description);
        } catch (err) {
          console.error("Error importing row:", row, err);
          errors++;
        }
      }
    });

    transaction(data);

    return {
      success: true,
      message: `Import complete: ${created} new items added, ${updated} items updated.${errors > 0 ? ` (${errors} errors)` : ""}`
    };

  } catch (err) {
    console.error("Inventory import error:", err);
    return { success: false, message: "Import failed: " + err.message };
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
