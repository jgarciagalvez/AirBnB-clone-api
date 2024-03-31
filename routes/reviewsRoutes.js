// Import files
import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
const jwtSecret = process.env.JWSECRET

// Create router
const router = Router()

// Define a POST route for reviews
router.post('/reviews', async (req, res) => {
  try {
    // Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }

    // Deconstract request body
    const { house_id, rating, review_text } = req.body

    // Get current date
    let date = new Date()
    date = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()

    // Define finalQuery to INSERT newReview into DB
    let finalQuery = `
    INSERT INTO reviews (
        house_id,
        reviewer_id,
        review_date,
        rating,
        review_text
    )
    VALUES(
      '${house_id}',
      '${decodedToken.user_id}',
      '${date}',
      '${rating}',
      '${review_text}'
    )
    RETURNING *`

    // Insert Review
    let { rows } = await db.query(finalQuery)

    // Get author fields
    let { rows: userRows } = await db.query(`
      SELECT users.first_name, users.last_name, users.profile_pic FROM users
      WHERE user_id = ${decodedToken.user_id}
    `)
    let newReview = rows[0]
    newReview.author = userRows[0]
    const formatter = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    const formatted = formatter.format(new Date(newReview.review_date))
    newReview.review_date = formatted
    res.json(newReview)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a GET route for fetching all reviews
router.get('/reviews', async (req, res) => {
  try {
    if (!req.query.house_id) {
      throw new Error('house_id is required')
    }
    let sqlquery = `
      SELECT reviews.*, users.first_name, users.last_name, users.profile_pic FROM reviews
      LEFT JOIN users ON users.user_id = reviews.reviewer_id
      WHERE reviews.house_id = ${req.query.house_id}
      ORDER BY reviews.review_date DESC
    `
    let { rows } = await db.query(sqlquery)

    const formatter = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })

    // Move user data to sub-object author
    let reviews = rows.map((r) => {
      r.author = {
        first_name: r.first_name,
        last_name: r.last_name,
        profile_pic: r.profile_pic
      }
      r.review_date = formatter.format(new Date(r.review_date))
      delete r.first_name
      delete r.last_name
      delete r.profile_pic
      return r
    })

    // API Response
    res.json(reviews)
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

router.delete('/reviews/:review_id', async (req, res) => {
  try {
    const { rows } = await db.query(`
  DELETE FROM reviews WHERE review_id = ${req.params.review_id}
  RETURNING *`)
    if (!rows.length) {
      throw new Error('Review not found')
    }
    res.json(rows)
  } catch (err) {
    res.json(err.message)
  }
})

export default router
