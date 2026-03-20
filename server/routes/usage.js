import { Router } from 'express'
import db from '../db/schema.js'

const router = Router()
const USER_ID = 1

// GET /daily - daily usage stats
router.get('/daily', (req, res) => {
  try {
    const { days = 30 } = req.query
    const stats = db.prepare(`
      SELECT
        date(created_at) as date,
        COUNT(*) as request_count,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(input_tokens + output_tokens) as total_tokens,
        ROUND(SUM(cost_estimate), 4) as total_cost
      FROM usage_tracking
      WHERE user_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY date(created_at)
      ORDER BY date DESC
    `).all(USER_ID, parseInt(days))

    res.json({ success: true, data: stats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /monthly - monthly usage stats
router.get('/monthly', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as request_count,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(input_tokens + output_tokens) as total_tokens,
        ROUND(SUM(cost_estimate), 4) as total_cost
      FROM usage_tracking
      WHERE user_id = ?
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `).all(USER_ID)

    res.json({ success: true, data: stats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /by-model - usage grouped by model
router.get('/by-model', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        model,
        COUNT(*) as request_count,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(input_tokens + output_tokens) as total_tokens,
        ROUND(SUM(cost_estimate), 4) as total_cost
      FROM usage_tracking
      WHERE user_id = ?
      GROUP BY model
      ORDER BY total_tokens DESC
    `).all(USER_ID)

    res.json({ success: true, data: stats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /conversations/:id - usage for specific conversation
router.get('/conversations/:id', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        model,
        COUNT(*) as request_count,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(input_tokens + output_tokens) as total_tokens,
        ROUND(SUM(cost_estimate), 4) as total_cost
      FROM usage_tracking
      WHERE user_id = ? AND conversation_id = ?
      GROUP BY model
    `).all(USER_ID, req.params.id)

    const total = db.prepare(`
      SELECT
        COUNT(*) as request_count,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(input_tokens + output_tokens) as total_tokens,
        ROUND(SUM(cost_estimate), 4) as total_cost
      FROM usage_tracking
      WHERE user_id = ? AND conversation_id = ?
    `).get(USER_ID, req.params.id)

    res.json({ success: true, data: { by_model: stats, total } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
