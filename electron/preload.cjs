const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mihrabDesktop', {
  isDesktop: true,
  platform: process.platform,
  updateTraySummary: (summary) => {
    if (typeof summary === 'string') {
      ipcRenderer.send('mihrab:tray-summary', summary);
    }
  },
  showNotification: (title, body) => {
    if (typeof title === 'string' && typeof body === 'string') {
      ipcRenderer.send('mihrab:notify', { title, body });
    }
  },
});
