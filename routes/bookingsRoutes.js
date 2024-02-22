import { Router } from 'express'
import db from '../db.js'
const router = Router()

// POST API Calls
// Add new booking to database
router.post('/bookings', async (req, res) => {
  try {
    // INSERT Query with post parameters
    const newBooking = await db.query(`
      INSERT INTO bookings (guest_id, house_id, check_in_date, check_out_date, total_price)
      VALUES (
        ${req.body.guest_id},
        ${req.body.house_id},
        '${req.body.check_in_date}',
        '${req.body.check_out_date}',
        ${req.body.total_price}
        )
      RETURNING *
    `)
    res.json(newBooking)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// GET API calls
// Fetch bookings from database
router.get('/bookings', async (req, res) => {
  try {
    // Select Query based on whether there is a userID or not
    let finalQuery = !req.query.userid
      ? 'SELECT * FROM bookings ORDER by check_in_date DESC'
      : `SELECT * FROM bookings WHERE guest_id = ${req.query.userid} ORDER BY check_in_date DESC`

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
