import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db/schema.js'

const router = Router()
const USER_ID = 1

// GET / - list projects for user
router.get('/', (req, res) => {
  try {
    const projects = db.prepare(
      'SELECT * FROM projects WHERE user_id = ? AND is_archived = 0 ORDER BY is_pinned DESC, updated_at DESC'
    ).all(USER_ID)
    res.json({ success: true, data: projects })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST / - create project
router.post('/', (req, res) => {
  try {
    const { name, description = '', color = '#CC785C', custom_instructions = '' } = req.body
    if (!name) return res.status(400).json({ success: false, error: 'Project name is required' })

    const result = db.prepare(
      'INSERT INTO projects (user_id, name, description, color, custom_instructions) VALUES (?, ?, ?, ?, ?)'
    ).run(USER_ID, name, description, color, custom_instructions)

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid)
    res.json({ success: true, data: project })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /:id - get project
router.get('/:id', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, USER_ID)
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' })
    res.json({ success: true, data: project })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /:id - update project
router.put('/:id', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, USER_ID)
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' })

    const { name, description, color, custom_instructions, is_archived, is_pinned } = req.body
    db.prepare(`
      UPDATE projects SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        color = COALESCE(?, color),
        custom_instructions = COALESCE(?, custom_instructions),
        is_archived = COALESCE(?, is_archived),
        is_pinned = COALESCE(?, is_pinned),
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(name, description, color, custom_instructions, is_archived, is_pinned, req.params.id, USER_ID)

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /:id - delete project
router.delete('/:id', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, USER_ID)
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' })

    // Unlink conversations from this project
    db.prepare('UPDATE conversations SET project_id = NULL WHERE project_id = ?').run(req.params.id)
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
    res.json({ success: true, data: { deleted: true } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /:id/conversations - get conversations in project
router.get('/:id/conversations', (req, res) => {
  try {
    const conversations = db.prepare(
      'SELECT * FROM conversations WHERE project_id = ? AND user_id = ? AND is_deleted = 0 ORDER BY updated_at DESC'
    ).all(req.params.id, USER_ID)
    res.json({ success: true, data: conversations })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /:id/settings - update project settings
router.put('/:id/settings', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, USER_ID)
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' })

    const { custom_instructions, knowledge_base_path } = req.body
    db.prepare(`
      UPDATE projects SET
        custom_instructions = COALESCE(?, custom_instructions),
        knowledge_base_path = COALESCE(?, knowledge_base_path),
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(custom_instructions, knowledge_base_path, req.params.id, USER_ID)

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
