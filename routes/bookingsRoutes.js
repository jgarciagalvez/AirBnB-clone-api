import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Fetch bookings from database
router.get('/bookings', async (req, res) => {
  try {
    // Select Query based on whether there is a userID or not
    let finalQuery = !req.query.userid
      ? 'SELECT * FROM bookings ORDER by check_in_date DESC'
      : `SELECT * FROM bookings WHERE guest_id = ${req.query.userid} ORDER by check_in_date DESC`

    // Deconstruct rows using finalQuery
    const { rows } = await db.query(finalQuery)

    // Throw Error if the userid provided is not on database or
    if (!rows.length) {
      throw new Error(`User has no bookings or doesn't exist`)
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Fetch bookings with index of 1
router.get('/bookings/:bookingId', async (req, res) => {
  const { bookingId } = req.params
  try {
    const { rows } = await db.query(
      `SELECT * FROM bookings WHERE booking_id = ${bookingId}`
    )
    if (!rows.length) {
      throw new Error('Booking Id not found.')
    }
    res.json(rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
