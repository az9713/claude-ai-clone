import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db/schema.js'

const router = Router()

// GET /api/conversations
router.get('/', (req, res) => {
  const conversations = db.prepare(
    `SELECT * FROM conversations WHERE user_id = 1 AND is_deleted = 0
     ORDER BY is_pinned DESC, updated_at DESC`
  ).all()
  res.json({ success: true, data: conversations })
})

// POST /api/conversations
router.post('/', (req, res) => {
  const { title = 'New Chat', model = 'claude-sonnet-4-5-20250929', project_id = null, settings = {} } = req.body
  const id = randomUUID()
  db.prepare(
    `INSERT INTO conversations (id, user_id, title, model, project_id, settings)
     VALUES (?, 1, ?, ?, ?, ?)`
  ).run(id, title, model, project_id, JSON.stringify(settings))
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id)
  res.json({ success: true, data: conv })
})

// GET /api/conversations/:id
router.get('/:id', (req, res) => {
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ? AND is_deleted = 0').get(req.params.id)
  if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' })
  res.json({ success: true, data: conv })
})

// PUT /api/conversations/:id
router.put('/:id', (req, res) => {
  const { title, model, is_archived, is_pinned, settings, project_id } = req.body
  const updates = [`updated_at = datetime('now')`]
  const params = []
  if (title !== undefined) { updates.push('title = ?'); params.push(title) }
  if (model !== undefined) { updates.push('model = ?'); params.push(model) }
  if (is_archived !== undefined) { updates.push('is_archived = ?'); params.push(is_archived ? 1 : 0) }
  if (is_pinned !== undefined) { updates.push('is_pinned = ?'); params.push(is_pinned ? 1 : 0) }
  if (settings !== undefined) { updates.push('settings = ?'); params.push(JSON.stringify(settings)) }
  if (project_id !== undefined) { updates.push('project_id = ?'); params.push(project_id) }
  params.push(req.params.id)
  db.prepare(`UPDATE conversations SET ${updates.join(', ')} WHERE id = ?`).run(...params)
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id)
  res.json({ success: true, data: conv })
})

// DELETE /api/conversations/:id
router.delete('/:id', (req, res) => {
  db.prepare(`UPDATE conversations SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?`).run(req.params.id)
  res.json({ success: true, data: { deleted: true } })
})

// POST /api/conversations/:id/duplicate
router.post('/:id/duplicate', (req, res) => {
  const original = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id)
  if (!original) return res.status(404).json({ success: false, error: 'Not found' })
  const newId = randomUUID()
  db.prepare(
    `INSERT INTO conversations (id, user_id, title, model, project_id, settings)
     VALUES (?, 1, ?, ?, ?, ?)`
  ).run(newId, `${original.title} (copy)`, original.model, original.project_id, original.settings)
  // Copy messages
  const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ?').all(req.params.id)
  const insertMsg = db.prepare(
    'INSERT INTO messages (id, conversation_id, role, content, images) VALUES (?, ?, ?, ?, ?)'
  )
  for (const msg of messages) {
    insertMsg.run(randomUUID(), newId, msg.role, msg.content, msg.images)
  }
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(newId)
  res.json({ success: true, data: conv })
})

// PUT /api/conversations/:id/archive
router.put('/:id/archive', (req, res) => {
  const { archived = true } = req.body
  db.prepare(`UPDATE conversations SET is_archived = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(archived ? 1 : 0, req.params.id)
  res.json({ success: true, data: { archived } })
})

// PUT /api/conversations/:id/pin
router.put('/:id/pin', (req, res) => {
  const { pinned = true } = req.body
  db.prepare(`UPDATE conversations SET is_pinned = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(pinned ? 1 : 0, req.params.id)
  res.json({ success: true, data: { pinned } })
})

export default router
