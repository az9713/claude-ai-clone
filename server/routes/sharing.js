import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db/schema.js'

const router = Router()

// POST /api/share - create share link
router.post('/', (req, res) => {
  try {
    const { conversationId, expires_in_days, is_public = true } = req.body
    if (!conversationId) {
      return res.status(400).json({ success: false, error: 'conversationId is required' })
    }

    const conv = db.prepare('SELECT * FROM conversations WHERE id = ? AND is_deleted = 0').get(conversationId)
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' })
    }

    // Check if already shared
    const existing = db.prepare('SELECT * FROM shared_conversations WHERE conversation_id = ?').get(conversationId)
    if (existing) {
      return res.json({ success: true, data: existing })
    }

    const share_token = randomUUID()
    let expires_at = null
    if (expires_in_days) {
      const d = new Date()
      d.setDate(d.getDate() + expires_in_days)
      expires_at = d.toISOString()
    }

    db.prepare(
      `INSERT INTO shared_conversations (conversation_id, share_token, expires_at, is_public)
       VALUES (?, ?, ?, ?)`
    ).run(conversationId, share_token, expires_at, is_public ? 1 : 0)

    const share = db.prepare('SELECT * FROM shared_conversations WHERE share_token = ?').get(share_token)
    res.json({ success: true, data: share })
  } catch (err) {
    console.error('Share create error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/share/:token - get shared conversation with messages
router.get('/:token', (req, res) => {
  try {
    const share = db.prepare('SELECT * FROM shared_conversations WHERE share_token = ?').get(req.params.token)
    if (!share) {
      return res.status(404).json({ success: false, error: 'Shared conversation not found' })
    }

    // Check expiry
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({ success: false, error: 'This shared link has expired' })
    }

    // Increment view count
    db.prepare('UPDATE shared_conversations SET view_count = view_count + 1 WHERE id = ?').run(share.id)

    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(share.conversation_id)
    const messages = db.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).all(share.conversation_id)

    res.json({
      success: true,
      data: {
        share,
        conversation,
        messages,
      },
    })
  } catch (err) {
    console.error('Share get error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/share/:token - delete share
router.delete('/:token', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM shared_conversations WHERE share_token = ?').run(req.params.token)
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Share not found' })
    }
    res.json({ success: true, data: { deleted: true } })
  } catch (err) {
    console.error('Share delete error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/share/:token/settings - update share settings
router.put('/:token/settings', (req, res) => {
  try {
    const { is_public, expires_in_days } = req.body
    const share = db.prepare('SELECT * FROM shared_conversations WHERE share_token = ?').get(req.params.token)
    if (!share) {
      return res.status(404).json({ success: false, error: 'Share not found' })
    }

    const updates = []
    const params = []

    if (is_public !== undefined) {
      updates.push('is_public = ?')
      params.push(is_public ? 1 : 0)
    }
    if (expires_in_days !== undefined) {
      if (expires_in_days === null) {
        updates.push('expires_at = NULL')
      } else {
        const d = new Date()
        d.setDate(d.getDate() + expires_in_days)
        updates.push('expires_at = ?')
        params.push(d.toISOString())
      }
    }

    if (updates.length > 0) {
      params.push(req.params.token)
      db.prepare(`UPDATE shared_conversations SET ${updates.join(', ')} WHERE share_token = ?`).run(...params)
    }

    const updated = db.prepare('SELECT * FROM shared_conversations WHERE share_token = ?').get(req.params.token)
    res.json({ success: true, data: updated })
  } catch (err) {
    console.error('Share update error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
