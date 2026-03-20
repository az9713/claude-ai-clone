import { Router } from 'express'
import db from '../db/schema.js'

const router = Router()

// GET /api/folders - list folders for user
router.get('/', (req, res) => {
  try {
    const folders = db.prepare(
      `SELECT cf.*, COUNT(cfi.id) as conversation_count
       FROM conversation_folders cf
       LEFT JOIN conversation_folder_items cfi ON cf.id = cfi.folder_id
       WHERE cf.user_id = 1
       GROUP BY cf.id
       ORDER BY cf.position ASC, cf.created_at DESC`
    ).all()
    res.json({ success: true, data: folders })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/folders - create folder
router.post('/', (req, res) => {
  try {
    const { name, parent_folder_id = null, project_id = null } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Folder name is required' })
    }
    const result = db.prepare(
      `INSERT INTO conversation_folders (user_id, name, parent_folder_id, project_id)
       VALUES (1, ?, ?, ?)`
    ).run(name.trim(), parent_folder_id, project_id)
    const folder = db.prepare(
      `SELECT cf.*, 0 as conversation_count
       FROM conversation_folders cf WHERE cf.id = ?`
    ).get(result.lastInsertRowid)
    res.json({ success: true, data: folder })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/folders/:id - rename folder
router.put('/:id', (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Folder name is required' })
    }
    db.prepare('UPDATE conversation_folders SET name = ? WHERE id = ? AND user_id = 1')
      .run(name.trim(), req.params.id)
    const folder = db.prepare(
      `SELECT cf.*, COUNT(cfi.id) as conversation_count
       FROM conversation_folders cf
       LEFT JOIN conversation_folder_items cfi ON cf.id = cfi.folder_id
       WHERE cf.id = ?
       GROUP BY cf.id`
    ).get(req.params.id)
    if (!folder) return res.status(404).json({ success: false, error: 'Folder not found' })
    res.json({ success: true, data: folder })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/folders/:id - delete folder
router.delete('/:id', (req, res) => {
  try {
    const folder = db.prepare('SELECT * FROM conversation_folders WHERE id = ? AND user_id = 1')
      .get(req.params.id)
    if (!folder) return res.status(404).json({ success: false, error: 'Folder not found' })
    db.prepare('DELETE FROM conversation_folders WHERE id = ?').run(req.params.id)
    res.json({ success: true, data: { deleted: true } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/folders/:id/items - add conversation to folder
router.post('/:id/items', (req, res) => {
  try {
    const { conversationId } = req.body
    if (!conversationId) {
      return res.status(400).json({ success: false, error: 'conversationId is required' })
    }
    db.prepare(
      'INSERT OR IGNORE INTO conversation_folder_items (folder_id, conversation_id) VALUES (?, ?)'
    ).run(req.params.id, conversationId)
    res.json({ success: true, data: { folder_id: parseInt(req.params.id), conversation_id: conversationId } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/folders/:id/items/:conversationId - remove conversation from folder
router.delete('/:id/items/:conversationId', (req, res) => {
  try {
    db.prepare(
      'DELETE FROM conversation_folder_items WHERE folder_id = ? AND conversation_id = ?'
    ).run(req.params.id, req.params.conversationId)
    res.json({ success: true, data: { removed: true } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
