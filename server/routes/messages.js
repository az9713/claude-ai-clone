import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db/schema.js'

const router = Router()

// GET /api/conversations/:id/messages
router.get('/conversations/:id/messages', (req, res) => {
  const messages = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).all(req.params.id)
  res.json({ success: true, data: messages })
})

// POST /api/conversations/:id/messages
router.post('/conversations/:id/messages', (req, res) => {
  const { role, content, images = [] } = req.body
  const id = randomUUID()
  db.prepare(
    `INSERT INTO messages (id, conversation_id, role, content, images)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, req.params.id, role, content, JSON.stringify(images))
  // Update conversation
  db.prepare(
    `UPDATE conversations SET
       last_message_at = datetime('now'),
       updated_at = datetime('now'),
       message_count = message_count + 1
     WHERE id = ?`
  ).run(req.params.id)
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id)
  res.json({ success: true, data: message })
})

// PUT /api/messages/:id
router.put('/messages/:id', (req, res) => {
  const { content } = req.body
  db.prepare(
    `UPDATE messages SET content = ?, edited_at = datetime('now') WHERE id = ?`
  ).run(content, req.params.id)
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id)
  res.json({ success: true, data: message })
})

// DELETE /api/messages/:id
router.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id)
  res.json({ success: true, data: { deleted: true } })
})

export default router
