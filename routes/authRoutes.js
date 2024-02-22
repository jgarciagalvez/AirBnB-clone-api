// Import files
import { Router } from 'express'
import db from '../db.js'

// Start app
const router = Router()

// Dummy data for GET calls
const userdata = [
  { user_id: 1, username: 'john@mail.com', password: 1234 },
  { user_id: 2, username: 'mary@mail.com', password: 56789 }
]

// POST route for signup
router.post('/signup', async (req, res) => {
  // Deconstruct body request
  let { first_name, last_name, profile_pic, email, password } = req.body

  // Define finalQuery to fetch data from DB
  const finalQuery =
    // Initial Query with first_name column as first_name is not nullable:
    `INSERT INTO users (first_name,` +
    // add last_name column if it is defined
    (last_name ? ` last_name,` : ``) +
    // add profile_pic column if it is defined
    (profile_pic ? ` profile_pic,` : ``) +
    // add email and password columns as they are not nullable
    ` email, password)` +
    // adding values extracted from the req.body
    `VALUES ('${first_name}',` +
    // add last name if it is defined
    (last_name ? ` '${last_name}',` : ``) +
    // add profile_pic if it is defined
    (profile_pic ? ` '${profile_pic}',` : ``) +
    // add email and password
    ` '${email}', '${password}')` +
    // return all updated rows
    `RETURNING *`

  try {
    console.log('Final query POST authRoutes: ', finalQuery)

    // check if required values are missing
    if (!first_name || !email || !password) {
      throw new Error('First name, Email and Password can not be empty.')
    }

    // check if user already exists
    const userExists = await db.query(
      `SELECT * FROM users WHERE email = '${email}'`
    )

    // if user exists throw error
    if (userExists.rows.length) {
      throw new Error('User already exists with this email address.')
    }

    // Fetch data from DB
    const { rows } = await db.query(finalQuery)

    res.json(rows)
  } catch (err) {
    if (err.message.includes('unique_email')) {
      res.json({
        error: 'User already exists with this email address.'
      })
    } else res.json({ error: err.message })
  }
})

// Define a POST route for login
router.post('/login', async (req, res) => {
  // Deconstruct body request
  const { email, password } = req.body
  // Define finalQuery to fetch data from DB
  const finalQuery = `
    SELECT * FROM users 
    WHERE
    email = '${email}'
    AND password = '${password}'
    `
  try {
    // Fetch data from DB
    const { rows } = await db.query(finalQuery)
    // Return an error if no user is found
    if (!rows.length) {
      throw new Error('Incorrect Login Credentials')
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a Get route for logout
router.get('/logout', (req, res) => {
  res.json(userdata)
})

// Export the router
export default router
