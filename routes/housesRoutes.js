// Import files
import { Router } from 'express'
import db from '../db.js'

// Create router
const router = Router()

// Define a Get route for fetching the list of houses
router.get('/houses', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM houses')
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a Get route for fetching individual house
router.get('/houses/:house_id', async (req, res) => {
  let house_id = req.params.house_id
  try {
    const { rows } = await db.query(
      `SELECT * FROM houses WHERE house_id = ${house_id}`
    )
    if (!rows.length) {
      throw new Error('Property not found')
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Export the router
export default router
