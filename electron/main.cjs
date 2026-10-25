const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const devUrl = process.env.VITE_DEV_SERVER_URL;
const isDev = !!devUrl;
// Paketni sinashda o‘qituvchining haqiqiy profiliga tegilmaydi.
const testDataDir = process.env.BILIM_ARENA_TEST_DATA_DIR;
if (testDataDir) app.setPath('userData', path.resolve(testDataDir));

let win = null;
// Yopish so‘rovi renderer orqali o‘tadi: kerak bo‘lsa PIN tekshiriladi,
// barcha kutilayotgan yozishlar tugagach chiqishga ruxsat beriladi.
let allowQuit = false;

const dataFile = () => path.join(app.getPath('userData'), 'data.json');

const { createDataStore } = require('./data-store.cjs');
const schema = import('../shared/data-schema.mjs');
const storage = async () => createDataStore(dataFile(), (await schema).validateData);
ipcMain.handle('data:load', async () => (await storage()).load());
ipcMain.handle('data:save', async (_event, data) => (await storage()).save(data));

ipcMain.handle('app:version', () => app.getVersion());

ipcMain.handle('app:quit', () => {
  allowQuit = true;
  app.quit();
});

// ---------- Avtomatik yangilanish (GitHub Releases) ----------
// Yangi versiya fonda yuklab olinadi. O'qituvchi dasturni yopganda o'rnatiladi,
// yoki sozlamalardan "Hozir o'rnatish" bosilsa — darhol.
let updateState = { status: app.isPackaged ? 'idle' : 'dev' };

function setUpdateState(state) {
  updateState = state;
  win?.webContents.send('update:status', state);
}

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.on('checking-for-update', () => setUpdateState({ status: 'checking' }));
autoUpdater.on('update-not-available', () => setUpdateState({ status: 'latest', checkedAt: Date.now() }));
autoUpdater.on('update-available', (info) => setUpdateState({ status: 'downloading', version: info.version, percent: 0 }));
autoUpdater.on('download-progress', (p) =>
  setUpdateState({ ...updateState, status: 'downloading', percent: Math.round(p.percent) }),
);
autoUpdater.on('update-downloaded', (info) => setUpdateState({ status: 'ready', version: info.version }));
autoUpdater.on('error', (error) => setUpdateState({ status: 'error', message: String(error?.message || error).slice(0, 300) }));

function checkForUpdates() {
  if (!app.isPackaged || testDataDir) return;
  // Internet bo'lmasa xato holati ko'rsatiladi, o'yin esa odatdagidek ishlayveradi.
  autoUpdater.checkForUpdates().catch(() => {});
}

ipcMain.handle('update:state', () => updateState);
ipcMain.handle('update:check', () => checkForUpdates());
ipcMain.handle('update:install', () => {
  if (updateState.status !== 'ready') return;
  allowQuit = true;
  autoUpdater.quitAndInstall(true, true);
});

function createWindow() {
  win = new BrowserWindow({
    show: !testDataDir,
    width: 1600,
    height: 900,
    fullscreen: false,
    kiosk: false,
    autoHideMenuBar: true,
    backgroundColor: '#070d21',
    // O'rnatilgan dasturda belgi .exe faylning o'zidan olinadi; bu faqat ishlab chiqish rejimi uchun.
    icon: isDev ? path.join(__dirname, '..', 'build', 'icon.png') : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!isDev) win.maximize();

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
    setTimeout(checkForUpdates, 5000);
    // Dastur kun bo'yi ochiq tursa ham yangilanish o'tkazib yuborilmasin.
    setInterval(checkForUpdates, 4 * 60 * 60 * 1000);
  });

  app.on('window-all-closed', () => app.quit());
}
