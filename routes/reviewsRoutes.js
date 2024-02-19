// Import files
import { Router } from 'express'
import db from '../db.js'

// Create router
const router = Router()

// Define a GET route for fetching all reviews
router.get('/reviews', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM reviews')
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a GET route to get a single review
router.get('/reviews/:review_id', async (req, res) => {
  let review_id = req.params.review_id
  try {
    const { rows } = await db.query(
      `SELECT * FROM reviews WHERE review_id = ${review_id}`
    )
    if (!rows.length) {
      throw new Error('Review not found')
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
