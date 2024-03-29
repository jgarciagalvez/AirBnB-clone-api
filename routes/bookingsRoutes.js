// Imprt Files
import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
const jwtSecret = process.env.JWTSECRET

// Start app
const router = Router()

// USER VERIFICATION
function decodeToken(cookie) {
  const decodedToken = jwt.verify(cookie, jwtSecret)
  if (!cookie || !decodedToken || !decodedToken.user_id) {
    throw new Error('Invalid authentication token')
  }
  return decodedToken
}

// POST API Calls
// Add new booking to database
router.post('/bookings', async (req, res) => {
  try {
    // USER VERIFICATION
    const decodedToken = decodeToken(req.cookies.jwt)

    // CREATE NEW BOOKING
    // INSERT Query with post parameters and forcing guest_id to be the user making the post request
    const { rows } = await db.query(`
      INSERT INTO bookings (guest_id, house_id, check_in_date, check_out_date, total_price)
      VALUES (
        ${decodedToken.user_id},
        ${req.body.house_id},
        '${req.body.check_in_date}',
        '${req.body.check_out_date}',
        ${req.body.total_price}
        )
      RETURNING *
    `)
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// GET API calls
// Fetch bookings from database
router.get('/bookings', async (req, res) => {
  try {
    // USER VERIFICATION
    const decodedToken = decodeToken(req.cookies.jwt)

    // Fetch bookings from DB based on user_id making the request
    const { rows } = await db.query(
      `SELECT * FROM bookings WHERE guest_id = ${decodedToken.user_id} ORDER BY check_in_date DESC`
    )

    // Throw Error if the userid provided is not on database or
    if (!rows.length) {
      throw new Error(`User has no bookings or doesn't exist`)
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Fetch bookings for logged in User
router.get('/bookings/:bookingId', async (req, res) => {
  const { bookingId } = req.params
  try {
    // USER VERIFICATION
    const decodedToken = decodeToken(req.cookies.jwt)

    // Fetch Booking
    const { rows } = await db.query(
      `SELECT * FROM bookings WHERE booking_id = ${bookingId}`
    )
    // Verify user is same as booking requested
    if (rows[0].guest_id !== decodedToken.user_id) {
      throw new Error('You are not authorized')
    }

    // Verify a booking was found
    if (!rows.length) {
      throw new Error('Booking Id not found.')
    }
    res.json(rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Delete booking
router.delete('/bookings/:bookingId', async (req, res) => {
  const { bookingId } = req.params
  try {
    // USER VERIFICATION
    const decodedToken = decodeToken(req.cookies.jwt)

    // Fetch booking from DB
    const { rows } = await db.query(
      `SELECT guest_id FROM bookings WHERE booking_id = ${bookingId}`
    )
    // Verify loggedInUser is the one requesting deletion
    if (rows[0].guest_id === decodedToken.user_id) {
      // Delete query
      const { rows } = await db.query(`
        DELETE FROM bookings WHERE booking_id = ${req.params.bookingId}
        RETURNING *`)

      // Verify there is a booking on that booking_id
      if (!rows.length) {
        throw new Error('Booking not found')
      }

      // Send response
      res.json('Booking successfully deleted')
    } else {
      // Throw error when guest_id on booking is not the same as user requesting the deletion
      throw new Error('You are not authorized')
    }
  } catch (err) {
    res.json(err.message)
  }
})

export default router
