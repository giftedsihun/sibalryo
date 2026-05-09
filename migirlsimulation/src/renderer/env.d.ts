/// <reference types="vite/client" />

// Electron preload bridge type
interface ElectronBridge {
  minimize: () => void
  maximize: () => void
  close: () => void
  getVersion: () => Promise<string>
  getEnv: (key: string) => Promise<string | null>
}

declare global {
  interface Window {
    electron?: ElectronBridge
  }
}

export {}
