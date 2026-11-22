const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  protocol,
  shell,
} = require('electron');
const { Tray } = require('electron');
const fs = require('fs');
const path = require('path');

// Özel güvenli protokol kaydı (kalıcı localStorage + IndexedDB + PDF.js ES Module Worker + Range desteği)
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'mihrab',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      allowServiceWorkers: true,
    },
  },
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.txt': 'text/plain; charset=utf-8',
};

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
  protocol.handle('mihrab', async (request) => {
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

      const ext = path.extname(targetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const fileBuf = await fs.promises.readFile(targetPath);
      const totalSize = fileBuf.length;

      const rangeHeader = request.headers.get('range');
      if (rangeHeader) {
        const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
        if (match) {
          const start = Number(match[1]);
          const end = match[2]
            ? Math.min(Number(match[2]), totalSize - 1)
            : totalSize - 1;
          if (start >= totalSize || end < start) {
            return new Response(null, {
              status: 416,
              headers: {
                'Content-Range': `bytes */${totalSize}`,
              },
            });
          }
          const slice = fileBuf.subarray(start, end + 1);
          return new Response(slice, {
            status: 206,
            headers: {
              'Content-Type': contentType,
              'Content-Range': `bytes ${start}-${end}/${totalSize}`,
              'Content-Length': String(slice.length),
              'Accept-Ranges': 'bytes',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      return new Response(fileBuf, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(totalSize),
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
        },
      });
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
