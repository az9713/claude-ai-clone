import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db/schema.js'

const router = Router()

// GET / - list artifacts for a conversation
router.get('/', (req, res) => {
  try {
    const { conversation_id } = req.query
    if (!conversation_id) {
      return res.status(400).json({ success: false, error: 'conversation_id is required' })
    }
    const artifacts = db.prepare(
      'SELECT * FROM artifacts WHERE conversation_id = ? ORDER BY created_at ASC'
    ).all(conversation_id)
    res.json({ success: true, data: artifacts })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /:id - get single artifact
router.get('/:id', (req, res) => {
  try {
    const artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(req.params.id)
    if (!artifact) {
      return res.status(404).json({ success: false, error: 'Artifact not found' })
    }
    res.json({ success: true, data: artifact })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /:id - update artifact content
router.put('/:id', (req, res) => {
  try {
    const { content, title, language } = req.body
    const existing = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Artifact not found' })
    }
    db.prepare(
      `UPDATE artifacts SET content = COALESCE(?, content), title = COALESCE(?, title),
       language = COALESCE(?, language), updated_at = datetime('now') WHERE id = ?`
    ).run(content, title, language, req.params.id)
    const updated = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(req.params.id)
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /:id - delete artifact
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Artifact not found' })
    }
    db.prepare('DELETE FROM artifacts WHERE id = ?').run(req.params.id)
    res.json({ success: true, data: { deleted: true } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /:id/fork - create new version (fork)
router.post('/:id/fork', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Artifact not found' })
    }

    // Get the max version for this identifier in this conversation
    const maxVersion = db.prepare(
      'SELECT MAX(version) as max_ver FROM artifacts WHERE conversation_id = ? AND identifier = ?'
    ).get(existing.conversation_id, existing.identifier)

    const newVersion = (maxVersion?.max_ver || existing.version) + 1
    const newId = randomUUID()
    const content = req.body.content || existing.content

    db.prepare(
      `INSERT INTO artifacts (id, message_id, conversation_id, type, title, identifier, language, content, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(newId, existing.message_id, existing.conversation_id, existing.type, existing.title, existing.identifier, existing.language, content, newVersion)

    const forked = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(newId)
    res.json({ success: true, data: forked })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /:id/versions - get version history
router.get('/:id/versions', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Artifact not found' })
    }
    const versions = db.prepare(
      'SELECT * FROM artifacts WHERE conversation_id = ? AND identifier = ? ORDER BY version ASC'
    ).all(existing.conversation_id, existing.identifier)
    res.json({ success: true, data: versions })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
