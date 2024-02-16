import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Fetch all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bookings')

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Fetch bookings with index of 1
router.get('/bookings/1', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM bookings WHERE booking_id = 1'
    )
    res.json(rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
