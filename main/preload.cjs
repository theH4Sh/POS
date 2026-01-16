const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  addMedicine: (data) => ipcRenderer.invoke("medicine:add", data),
  listMedicines: (data) => ipcRenderer.invoke("medicine:list")
});
