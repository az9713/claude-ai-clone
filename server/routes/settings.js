import { Router } from 'express'
import db from '../db/schema.js'

const router = Router()
const USER_ID = 1

// GET / - get user settings/preferences
router.get('/', (req, res) => {
  try {
    const user = db.prepare('SELECT preferences, custom_instructions FROM users WHERE id = ?').get(USER_ID)
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    let preferences = {}
    try { preferences = JSON.parse(user.preferences || '{}') } catch {}

    res.json({
      success: true,
      data: {
        preferences,
        custom_instructions: user.custom_instructions || '',
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT / - update settings
router.put('/', (req, res) => {
  try {
    const { preferences } = req.body
    if (!preferences) return res.status(400).json({ success: false, error: 'Preferences required' })

    // Merge with existing preferences
    const user = db.prepare('SELECT preferences FROM users WHERE id = ?').get(USER_ID)
    let existing = {}
    try { existing = JSON.parse(user.preferences || '{}') } catch {}
    const merged = { ...existing, ...preferences }

    db.prepare('UPDATE users SET preferences = ? WHERE id = ?').run(JSON.stringify(merged), USER_ID)
    res.json({ success: true, data: { preferences: merged } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /custom-instructions - get custom instructions
router.get('/custom-instructions', (req, res) => {
  try {
    const user = db.prepare('SELECT custom_instructions FROM users WHERE id = ?').get(USER_ID)
    res.json({ success: true, data: { custom_instructions: user?.custom_instructions || '' } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /custom-instructions - update custom instructions
router.put('/custom-instructions', (req, res) => {
  try {
    const { custom_instructions } = req.body
    if (custom_instructions === undefined) {
      return res.status(400).json({ success: false, error: 'custom_instructions required' })
    }

    db.prepare('UPDATE users SET custom_instructions = ? WHERE id = ?').run(custom_instructions, USER_ID)
    res.json({ success: true, data: { custom_instructions } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
