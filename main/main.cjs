const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { orm, medicines } = require("./db.cjs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  win.loadURL("http://localhost:5173");
}

ipcMain.handle("medicine:add", (_, data) => {
  orm.insert(medicines).values(data).run();
  return true;
});

ipcMain.handle("medicine:list", () => {
  return orm.select().from(medicines).all();
});

app.whenReady().then(createWindow);
