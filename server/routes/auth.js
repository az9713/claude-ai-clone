import { Router } from 'express'
import db from '../db/schema.js'

const router = Router()

// POST /api/auth/login - auto-create or login
router.post('/login', (req, res) => {
  const { email = 'user@claude.ai', name = 'User' } = req.body
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) {
    const result = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)').run(email, name)
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
  }
  db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`).run(user.id)
  res.json({ success: true, data: user })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, data: { message: 'Logged out' } })
})

// GET /api/auth/me
router.get('/me', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = 1').get()
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })
  res.json({ success: true, data: user })
})

// PUT /api/auth/profile
router.put('/profile', (req, res) => {
  const { name, avatar_url, preferences, custom_instructions } = req.body
  const updates = []
  const params = []
  if (name !== undefined) { updates.push('name = ?'); params.push(name) }
  if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url) }
  if (preferences !== undefined) { updates.push('preferences = ?'); params.push(JSON.stringify(preferences)) }
  if (custom_instructions !== undefined) { updates.push('custom_instructions = ?'); params.push(custom_instructions) }
  if (updates.length === 0) return res.json({ success: true, data: {} })
  params.push(1)
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params)
  const user = db.prepare('SELECT * FROM users WHERE id = 1').get()
  res.json({ success: true, data: user })
})

export default router
