const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Auth
  login: (username, password) => ipcRenderer.invoke("auth:login", { username, password }),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getCurrentUser: () => ipcRenderer.invoke("auth:getCurrentUser"),
  registerCashier: (username, password) => ipcRenderer.invoke("auth:registerCashier", { username, password }),
  getCashiers: () => ipcRenderer.invoke("auth:getCashiers"),

  // Medicine
  addMedicine: (data) => ipcRenderer.invoke("medicine:add", data),
  listMedicines: () => ipcRenderer.invoke("medicine:list"),
  searchProduct: (query) => ipcRenderer.invoke("medicine:search", query),
  updateStock: (data) => ipcRenderer.invoke("medicine:updateStock", data),
  createOrder: (data) => ipcRenderer.invoke("order:create", data),
  listLowStockAlerts: () => ipcRenderer.invoke("medicine:lowStock"),
  getDashboardStats: (params) => ipcRenderer.invoke("getDashboardStats", params),
});
