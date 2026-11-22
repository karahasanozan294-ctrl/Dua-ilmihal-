const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  protocol,
  net,
  shell,
} = require('electron');
const { Tray } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

// Özel güvenli protokol kaydı (kalıcı localStorage + IndexedDB + PDF.js Worker desteği)
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'mihrab',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const DIST_DIR = path.resolve(__dirname, '../dist');
const ICON_PNG = path.join(__dirname, 'icon.png');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Windows bildirim merkezi için uygulama kimliği
if (process.platform === 'win32') {
  app.setAppUserModelId('com.mihrab.namazvakti');
}

// Tek örnek kilidi (ikinci tıklamada mevcut pencereyi öne getirir)
const gotSingleLock = app.requestSingleInstanceLock();
if (!gotSingleLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function registerDistProtocol() {
  protocol.handle('mihrab', (request) => {
    try {
      const reqUrl = new URL(request.url);
      let reqPath = decodeURIComponent(reqUrl.pathname || '/');
      if (reqPath === '/' || reqPath === '') {
        reqPath = '/index.html';
      }

      const safeRelative = reqPath.replace(/^\/+/, '');
      let targetPath = path.resolve(DIST_DIR, safeRelative);

      // Dizin dışına çıkma (path traversal) engeli
      if (
        targetPath !== DIST_DIR &&
        !targetPath.startsWith(DIST_DIR + path.sep)
      ) {
        return new Response('Yasaklı yol', { status: 403 });
      }

      if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
        // SPA fallback (uzantısız yollar için index.html döndür)
        if (!path.extname(targetPath)) {
          targetPath = path.join(DIST_DIR, 'index.html');
        } else {
          return new Response('Bulunamadı', { status: 404 });
        }
      }

      return net.fetch(pathToFileURL(targetPath).toString());
    } catch {
      return new Response('Sunucu hatası', { status: 500 });
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1220,
    height: 840,
    minWidth: 420,
    minHeight: 620,
    title: 'Mihrab — Namaz Vakitleri & İslami Kitaplık',
    icon: ICON_PNG,
    autoHideMenuBar: true,
    backgroundColor: '#F7F5F0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL('mihrab://app/index.html');

  // Harici https bağlantılarını varsayılan Windows tarayıcısında aç
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url).catch(() => {});
    }
    return { action: 'deny' };
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && tray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  try {
    const img = nativeImage.createFromPath(ICON_PNG);
    tray = new Tray(img.isEmpty() ? ICON_PNG : img.resize({ width: 16, height: 16 }));
    tray.setToolTip('Mihrab · Namaz Vakitleri');

    const menu = Menu.buildFromTemplate([
      {
        label: 'Mihrab’ı Aç',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createWindow();
          }
        },
      },
      {
        label: 'Tepsiye Küçült',
        click: () => {
          if (mainWindow) mainWindow.hide();
        },
      },
      { type: 'separator' },
      {
        label: 'Tamamen Çık',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(menu);
    tray.on('click', () => {
      if (!mainWindow) {
        createWindow();
        return;
      }
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch {
    tray = null;
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerDistProtocol();
  createWindow();
  createTray();

  ipcMain.on('mihrab:tray-summary', (_event, summary) => {
    if (tray && typeof summary === 'string') {
      // Windows sistem tepsisi tooltip sınırı (~127 karakter)
      tray.setToolTip(summary.slice(0, 120));
    }
  });

  ipcMain.on('mihrab:notify', (_event, payload) => {
    if (!Notification.isSupported() || !payload) return;
    const title = String(payload.title || 'Mihrab Namaz Vakti');
    const body = String(payload.body || '');
    const notif = new Notification({
      title,
      body,
      icon: ICON_PNG,
    });
    notif.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
    notif.show();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) {
    app.quit();
  }
});
