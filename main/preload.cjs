const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  addMedicine: (data) => ipcRenderer.invoke("medicine:add", data),
  listMedicines: () => ipcRenderer.invoke("medicine:list"),
  searchProduct: (query) => ipcRenderer.invoke("medicine:search", query),
  updateStock: (data) => ipcRenderer.invoke("medicine:updateStock", data),
  createOrder: (data) => ipcRenderer.invoke("order:create", data),
  listLowStockAlerts: () => ipcRenderer.invoke("medicine:lowStock")
});
