import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),

  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // Env vars (allowlist only)
  getEnv: (key: string) => ipcRenderer.invoke('env:get', key)
})
