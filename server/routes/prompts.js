import { Router } from 'express'
import db from '../db/schema.js'

const router = Router()
const USER_ID = 1

const EXAMPLE_PROMPTS = [
  {
    id: 'example-1',
    title: 'Explain Like I\'m 5',
    description: 'Get a simple explanation of a complex topic',
    prompt_template: 'Explain the following topic as if I\'m a 5 year old: {{topic}}',
    category: 'learning',
    tags: ['education', 'simple'],
    is_example: true,
  },
  {
    id: 'example-2',
    title: 'Code Review',
    description: 'Get a thorough code review with suggestions',
    prompt_template: 'Please review the following code for bugs, performance issues, and best practices:\n\n```\n{{code}}\n```',
    category: 'coding',
    tags: ['development', 'review'],
    is_example: true,
  },
  {
    id: 'example-3',
    title: 'Summarize Text',
    description: 'Get a concise summary of long text',
    prompt_template: 'Please summarize the following text in 3-5 bullet points:\n\n{{text}}',
    category: 'writing',
    tags: ['summary', 'productivity'],
    is_example: true,
  },
  {
    id: 'example-4',
    title: 'Creative Story',
    description: 'Generate a creative short story',
    prompt_template: 'Write a short creative story about {{topic}} in the style of {{style}}. Make it engaging and about 300 words.',
    category: 'creative',
    tags: ['writing', 'creative'],
    is_example: true,
  },
  {
    id: 'example-5',
    title: 'Debug Helper',
    description: 'Help debug an error message',
    prompt_template: 'I\'m getting the following error:\n\n{{error}}\n\nIn this code:\n\n```\n{{code}}\n```\n\nPlease explain what\'s wrong and how to fix it.',
    category: 'coding',
    tags: ['debugging', 'development'],
    is_example: true,
  },
  {
    id: 'example-6',
    title: 'Email Drafter',
    description: 'Draft a professional email',
    prompt_template: 'Draft a professional email about {{topic}}. Tone: {{tone}}. Keep it concise.',
    category: 'writing',
    tags: ['email', 'professional'],
    is_example: true,
  },
]

// GET /library - list prompts
router.get('/library', (req, res) => {
  try {
    const { category, search } = req.query
    let query = 'SELECT * FROM prompt_library WHERE user_id = ?'
    const params = [USER_ID]

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    query += ' ORDER BY usage_count DESC, updated_at DESC'

    const prompts = db.prepare(query).all(...params)
    res.json({ success: true, data: prompts })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /library - create prompt
router.post('/library', (req, res) => {
  try {
    const { title, description = '', prompt_template, category = 'general', tags = [] } = req.body
    if (!title || !prompt_template) {
      return res.status(400).json({ success: false, error: 'Title and prompt_template are required' })
    }

    const result = db.prepare(
      'INSERT INTO prompt_library (user_id, title, description, prompt_template, category, tags) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(USER_ID, title, description, prompt_template, category, JSON.stringify(tags))

    const prompt = db.prepare('SELECT * FROM prompt_library WHERE id = ?').get(result.lastInsertRowid)
    res.json({ success: true, data: prompt })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /categories - list categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(
      'SELECT DISTINCT category FROM prompt_library WHERE user_id = ? ORDER BY category'
    ).all(USER_ID).map(r => r.category)

    const allCategories = [...new Set([...categories, 'general', 'coding', 'writing', 'creative', 'learning'])]
    res.json({ success: true, data: allCategories.sort() })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /examples - list example prompts
router.get('/examples', (req, res) => {
  res.json({ success: true, data: EXAMPLE_PROMPTS })
})

// GET /:id - get prompt
router.get('/:id', (req, res) => {
  try {
    const prompt = db.prepare('SELECT * FROM prompt_library WHERE id = ? AND user_id = ?').get(req.params.id, USER_ID)
    if (!prompt) return res.status(404).json({ success: false, error: 'Prompt not found' })
    res.json({ success: true, data: prompt })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /:id - update prompt
router.put('/:id', (req, res) => {
  try {
    const prompt = db.prepare('SELECT * FROM prompt_library WHERE id = ? AND user_id = ?').get(req.params.id, USER_ID)
    if (!prompt) return res.status(404).json({ success: false, error: 'Prompt not found' })

    const { title, description, prompt_template, category, tags } = req.body
    db.prepare(`
      UPDATE prompt_library SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        prompt_template = COALESCE(?, prompt_template),
        category = COALESCE(?, category),
        tags = COALESCE(?, tags),
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(title, description, prompt_template, category, tags ? JSON.stringify(tags) : null, req.params.id, USER_ID)

    const updated = db.prepare('SELECT * FROM prompt_library WHERE id = ?').get(req.params.id)
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /:id - delete prompt
router.delete('/:id', (req, res) => {
  try {
    const prompt = db.prepare('SELECT * FROM prompt_library WHERE id = ? AND user_id = ?').get(req.params.id, USER_ID)
    if (!prompt) return res.status(404).json({ success: false, error: 'Prompt not found' })

    db.prepare('DELETE FROM prompt_library WHERE id = ?').run(req.params.id)
    res.json({ success: true, data: { deleted: true } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
