import { Router } from 'express'
import db from '../db/schema.js'

const router = Router()

// GET /api/search/conversations?q=query - search conversations by title/content
router.get('/conversations', (req, res) => {
  try {
    const { q } = req.query
    if (!q || !q.trim()) {
      return res.json({ success: true, data: [] })
    }
    const query = `%${q.trim()}%`
    const conversations = db.prepare(
      `SELECT DISTINCT c.* FROM conversations c
       LEFT JOIN messages m ON m.conversation_id = c.id
       WHERE c.user_id = 1 AND c.is_deleted = 0
         AND (c.title LIKE ? OR m.content LIKE ?)
       ORDER BY c.updated_at DESC
       LIMIT 50`
    ).all(query, query)
    res.json({ success: true, data: conversations })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/search/messages?q=query - search messages by content
router.get('/messages', (req, res) => {
  try {
    const { q } = req.query
    if (!q || !q.trim()) {
      return res.json({ success: true, data: [] })
    }
    const query = `%${q.trim()}%`
    const messages = db.prepare(
      `SELECT m.*, c.title as conversation_title
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.user_id = 1 AND c.is_deleted = 0
         AND m.content LIKE ?
       ORDER BY m.created_at DESC
       LIMIT 50`
    ).all(query)
    res.json({ success: true, data: messages })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
