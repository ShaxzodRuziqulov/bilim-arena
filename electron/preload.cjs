const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  load: () => ipcRenderer.invoke('data:load'),
  save: (data) => ipcRenderer.invoke('data:save', data),
  version: () => ipcRenderer.invoke('app:version'),
  quit: () => ipcRenderer.invoke('app:quit'),
  onCloseRequested: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('app:close-requested', listener);
    return () => ipcRenderer.removeListener('app:close-requested', listener);
  },
});
