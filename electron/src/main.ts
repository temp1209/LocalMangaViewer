const { app, BrowserWindow } = require('electron');
const path = require("path");

const serverApp = require("../../server/dist/server.js");
const PORT = 3000;

// サーバー起動
serverApp.default.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../dist-electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../client/dist/src/pages/mangaList/mangaList.html'));
  }
};

app.whenReady().then(createWindow);