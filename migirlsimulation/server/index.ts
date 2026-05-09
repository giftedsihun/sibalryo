import express, { Request, Response } from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

export function createExpressApp() {
  const app = express()

  app.use(cors({ origin: ['http://localhost:5173', 'app://.' ] }))
  app.use(express.json({ limit: '2mb' }))

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // ── Claude Dialogue Generation ──────────────────────────────────────────────
  app.post('/api/claude/generate', async (req: Request, res: Response) => {
    try {
      const { systemPrompt, context } = req.body as {
        systemPrompt: string
        context: string
      }

      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: context }]
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      res.json({ dialogue: text.trim() })
    } catch (err: unknown) {
      const error = err as Error
      console.error('[Claude] Error:', error.message)
      res.status(500).json({ error: error.message })
    }
  })

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() })
  })

  return app
}
