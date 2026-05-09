import * as dotenv from 'dotenv'

dotenv.config()

// This is a dev-only script to run Express + open Vite separately
// In production, the Express server is embedded in Electron main.ts
// Use: node -r ts-node/register server/dev.ts

import { createExpressApp } from './index'

const port = parseInt(process.env.PROXY_PORT ?? '3001', 10)
const app = createExpressApp()
app.listen(port, '127.0.0.1', () => {
  console.log(`[Dev Proxy] Claude proxy running on http://localhost:${port}`)
})
