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
  openWidgetWindow: () => {
    ipcRenderer.send('mihrab:open-widget');
  },
  closeWidgetWindow: () => {
    ipcRenderer.send('mihrab:close-widget');
  },
  setWidgetAlwaysOnTop: (pinned) => {
    ipcRenderer.send('mihrab:widget-pin', Boolean(pinned));
  },
  focusMainWindow: () => {
    ipcRenderer.send('mihrab:focus-main');
  },
});

