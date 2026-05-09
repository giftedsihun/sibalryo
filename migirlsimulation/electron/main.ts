import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { spawn, ChildProcess } from 'child_process'
import * as http from 'http'

// ── OmniVoice Python server ──────────────────────────────────────────────────
let omniVoiceProcess: ChildProcess | null = null

function isOmniVoiceRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      { host: '127.0.0.1', port: 8000, path: '/', method: 'GET', timeout: 1000 },
      () => resolve(true)
    )
    req.on('error', () => resolve(false))
    req.on('timeout', () => { req.destroy(); resolve(false) })
    req.end()
  })
}

async function waitForOmniVoice(maxWaitMs = 90000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    if (await isOmniVoiceRunning()) return true
    await new Promise(r => setTimeout(r, 1500))
  }
  return false
}

async function startOmniVoice() {
  const already = await isOmniVoiceRunning()
  if (already) {
    console.log('[OmniVoice] Already running on :8000')
    mainWindow?.webContents.send('omnivoice:status', 'ready')
    return
  }

  console.log('[OmniVoice] Starting server...')
  mainWindow?.webContents.send('omnivoice:status', 'loading')

  const isPackaged = app.isPackaged
  let pythonExe = ''
  let scriptPath = ''
  let sitePackages = ''
  let hfHome = ''

  if (isPackaged) {
    const omnivoiceDir = join(process.resourcesPath, 'omnivoice')
    // Use the bundled standalone Python (not the venv shim)
    pythonExe = join(omnivoiceDir, 'python', 'python.exe')
    scriptPath = join(omnivoiceDir, 'game_server.py')
    sitePackages = join(omnivoiceDir, 'venv', 'Lib', 'site-packages')
    hfHome = join(omnivoiceDir, 'hf_cache')
  } else {
    // In dev, assuming omnivoice is a sibling to migirlsimulation
    const omnivoiceDir = join(app.getAppPath(), '..', 'omnivoice')
    pythonExe = join(omnivoiceDir, 'python', 'python.exe')
    scriptPath = join(omnivoiceDir, 'game_server.py')
    sitePackages = join(omnivoiceDir, 'venv', 'Lib', 'site-packages')
    hfHome = join(omnivoiceDir, 'hf_cache')
  }

  const spawnEnv = {
    ...process.env,
    PYTHONPATH: sitePackages,
    HF_HOME: hfHome,
    PYTHONDONTWRITEBYTECODE: '1',
  }

  // Windows hide ensures no console window appears
  omniVoiceProcess = spawn(pythonExe, [scriptPath, '--model', 'k2-fsa/OmniVoice', '--port', '8000'], {
    detached: false,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: require('path').dirname(scriptPath),
    env: spawnEnv
  })

  omniVoiceProcess.stdout?.on('data', (d: Buffer) => console.log('[OmniVoice]', d.toString().trim()))
  omniVoiceProcess.stderr?.on('data', (d: Buffer) => console.log('[OmniVoice]', d.toString().trim()))
  omniVoiceProcess.on('error', (err) => {
    console.error('[OmniVoice] Spawn error:', err)
    mainWindow?.webContents.send('omnivoice:status', 'error')
  })
  omniVoiceProcess.on('exit', (code) => {
    console.log('[OmniVoice] Exited with code', code)
    if (code !== 0 && code !== null) mainWindow?.webContents.send('omnivoice:status', 'error')
  })

  // Wait for server to be ready (model loading takes time)
  const ready = await waitForOmniVoice(90000)
  if (ready) {
    console.log('[OmniVoice] ✅ Server ready on :8000')
    mainWindow?.webContents.send('omnivoice:status', 'ready')
  } else {
    console.error('[OmniVoice] ❌ Server did not start within 90s')
    mainWindow?.webContents.send('omnivoice:status', 'timeout')
  }
}

// ── BrowserWindow ─────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#0A0E1A',
    titleBarStyle: 'hiddenInset',
    frame: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show()
    mainWindow!.maximize()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())
ipcMain.handle('app:getVersion', () => app.getVersion())

// ── Lifecycle ─────────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Window shows first, then OmniVoice starts in background
  createWindow()

  // OmniVoice takes time to load model — run after window is ready
  mainWindow!.once('ready-to-show', () => {
    startOmniVoice()  // non-blocking, sends IPC when ready
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

const cleanup = () => {
  if (omniVoiceProcess && !omniVoiceProcess.killed) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', omniVoiceProcess.pid!.toString(), '/f', '/t'])
      } else {
        omniVoiceProcess.kill()
      }
    } catch(e) {}
  }
}

app.on('before-quit', cleanup)

app.on('window-all-closed', () => {
  cleanup()
  if (process.platform !== 'darwin') app.quit()
})
