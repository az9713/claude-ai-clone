import express from 'express'
import cors from 'cors'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Import DB to ensure schema creation runs
import './db/schema.js'

// Import route modules
import authRoutes from './routes/auth.js'
import conversationRoutes from './routes/conversations.js'
import messageRoutes from './routes/messages.js'
import claudeRoutes from './routes/claude.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api', messageRoutes)
app.use('/api/claude', claudeRoutes)

// Dynamically load optional route modules (added by later waves)
const optionalRoutes = [
  { path: '/api/artifacts', module: './routes/artifacts.js' },
  { path: '/api/folders', module: './routes/folders.js' },
  { path: '/api/search', module: './routes/search.js' },
  { path: '/api/projects', module: './routes/projects.js' },
  { path: '/api/settings', module: './routes/settings.js' },
  { path: '/api/prompts', module: './routes/prompts.js' },
  { path: '/api/usage', module: './routes/usage.js' },
  { path: '/api/share', module: './routes/sharing.js' },
]

for (const route of optionalRoutes) {
  try {
    const mod = await import(route.module)
    app.use(route.path, mod.default)
    console.log(`  Loaded: ${route.path}`)
  } catch {
    // Route not yet implemented by its wave — skip silently
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`\n  Claude Clone API server running on http://localhost:${PORT}`)
  console.log(`  Database: server/data/claude.db\n`)
})
