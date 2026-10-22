const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const devUrl = process.env.VITE_DEV_SERVER_URL;
const isDev = !!devUrl;

let win = null;
// Bolalar doskada Alt+F4 yoki yopish tugmasini bosib qo'ymasligi uchun
// chiqishga faqat PIN tasdiqlangandan keyin ruxsat beriladi.
let allowQuit = false;

const dataFile = () => path.join(app.getPath('userData'), 'data.json');

ipcMain.handle('data:load', () => {
  try {
    return JSON.parse(fs.readFileSync(dataFile(), 'utf8'));
  } catch {
    return null;
  }
});

ipcMain.handle('data:save', (_event, data) => {
  const file = dataFile();
  const tmp = file + '.tmp';
  // Avval vaqtinchalik faylga yozib, keyin almashtiramiz — yozish paytida
  // tok o'chib qolsa ham eski ma'lumot buzilmaydi.
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, file);
  return true;
});

ipcMain.handle('app:version', () => app.getVersion());

ipcMain.handle('app:quit', () => {
  allowQuit = true;
  app.quit();
});

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    fullscreen: !isDev,
    kiosk: !isDev,
    autoHideMenuBar: true,
    backgroundColor: '#070d21',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Sensorli doskada barmoqlar bilan tasodifan kattalashtirib yuborilmasin.
  win.webContents.setVisualZoomLevelLimits(1, 1);

  win.on('close', (event) => {
    if (!allowQuit && !isDev) {
      event.preventDefault();
      win.webContents.send('app:close-requested');
    }
  });

  if (isDev) win.loadURL(devUrl);
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    // Menyuni olib tashlash DevTools tugmalarini ham o'chiradi.
    if (!isDev) Menu.setApplicationMenu(null);
    createWindow();
  });

  app.on('window-all-closed', () => app.quit());
}
