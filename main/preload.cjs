const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Auth
  checkSystemStatus: () => ipcRenderer.invoke("auth:checkSystemStatus"),
  registerAdmin: (data) => ipcRenderer.invoke("auth:registerAdmin", data),
  login: (username, password) => ipcRenderer.invoke("auth:login", { username, password }),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getCurrentUser: () => ipcRenderer.invoke("auth:getCurrentUser"),
  registerCashier: (username, password) => ipcRenderer.invoke("auth:registerCashier", { username, password }),
  getCashiers: () => ipcRenderer.invoke("auth:getCashiers"),
  deleteCashier: (id) => ipcRenderer.invoke("auth:deleteCashier", id),
  updateProfile: (data) => ipcRenderer.invoke("auth:updateProfile", data),

  // Medicine
  addMedicine: (data) => ipcRenderer.invoke("medicine:add", data),
  listMedicines: () => ipcRenderer.invoke("medicine:list"),
  searchProduct: (query) => ipcRenderer.invoke("medicine:search", query),
  updateStock: (data) => ipcRenderer.invoke("medicine:updateStock", data),
  updateMedicine: (data) => ipcRenderer.invoke("medicine:update", data),
  deleteMedicine: (id) => ipcRenderer.invoke("medicine:delete", id),
  createOrder: (data) => ipcRenderer.invoke("order:create", data),
  listLowStockAlerts: () => ipcRenderer.invoke("medicine:lowStock"),
  getDashboardStats: (params) => ipcRenderer.invoke("getDashboardStats", params),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSetting: (data) => ipcRenderer.invoke("settings:update", data),
});
