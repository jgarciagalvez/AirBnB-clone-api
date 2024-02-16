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
    res.json(err)
  }
})

// Define a Get route for fetching individual house
router.get('/houses/2', async (req, res) => {
  let house_id = 2
  try {
    const { rows } = await db.query(
      `SELECT * FROM houses WHERE house_id = ${house_id}`
    )
    res.json(rows)
  } catch (err) {
    res.json(err)
  }
})

// Export the router
export default router
