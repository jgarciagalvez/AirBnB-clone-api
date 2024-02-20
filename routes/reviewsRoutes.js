// Import files
import { Router } from 'express'
import db from '../db.js'

// Create router
const router = Router()

// Define a GET route for fetching all reviews
router.get('/reviews', async (req, res) => {
  const { house_id } = req.query

  const finalQuery = !house_id
    ? `SELECT * FROM reviews ORDER BY review_date DESC`
    : `SELECT * FROM reviews WHERE house_id = ${house_id} ORDER BY review_date DESC`

  // console.log('Final query reviews GET: ', finalQuery)
  try {
    const { rows } = await db.query(finalQuery)
    if (!rows.length) {
      throw new Error('No reviews found for this house ID')
    }
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
