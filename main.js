const { app, BrowserWindow } = require("electron");

const url = "https://h3yun.com/index.php?g=Chuanyun&m=Index&a=login";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 1024,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadURL(url);
};

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
