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
router.get('/reviews/2', async (req, res) => {
  let review_id = 2
  try {
    const { rows } = await db.query(
      `SELECT * FROM reviews WHERE review_id = ${review_id}`
    )
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
