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

    // Validate fields
    let { house_id, check_in_date, check_out_date, message, price_per_night } =
      req.body
    if (!house_id || !check_in_date || !check_out_date || !message) {
      throw new Error(
        'house_id, check_in_date, check_out_date, and message are required'
      )
    }

    // Calculate total nights
    let checkingDate = new Date(check_in_date)
    let checkoutDate = new Date(check_out_date)
    if (checkoutDate <= checkingDate) {
      throw new Error('to_date must be after from_date')
    }
    const totalNights = Math.round(
      (checkoutDate - checkingDate) / (1000 * 60 * 60 * 24)
    )
    // Calculate total price
    const totalPrice = totalNights * price_per_night

    // INSERT Query with post parameters and forcing guest_id to be the user making the post request
    const { rows } = await db.query(`
      INSERT INTO bookings (guest_id, house_id, check_in_date, check_out_date, nights, total_price)
      VALUES (
        ${decodedToken.user_id},
        ${house_id},
        '${check_in_date}',
        '${check_out_date}',
        ${totalNights},
        ${totalPrice}
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

    let query = `
      SELECT
        TO_CHAR(bookings.check_in_date, 'D Mon yyyy') AS check_in_date,
        TO_CHAR(bookings.check_out_date, 'D Mon yyyy') AS check_out_date,
        bookings.nights,
        bookings.total_price,
        houses.house_id,
        houses.price_per_night,
        houses.location,
        houses.bedrooms,
        houses.bathrooms,
        houses.review_count,
        houses.rating,
        hp.photo
      FROM bookings
      LEFT JOIN houses ON houses.house_id = bookings.house_id
      LEFT JOIN (
          SELECT DISTINCT ON (house_id) house_id, photo
          FROM house_pics
      ) AS hp ON hp.house_id = houses.house_id
      WHERE bookings.guest_id = ${decodedToken.user_id}
      ORDER BY bookings.check_in_date DESC
    `

    const { rows } = await db.query(query)

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
