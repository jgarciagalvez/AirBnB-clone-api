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
  const { first_name, last_name, profile_pic, email, password } = req.body

  // Define finalQuery to fetch data from DB
  const finalQuery = `INSERT INTO users (first_name, last_name, profile_pic, email, password)
  VALUES ('${first_name}', '${last_name}', '${profile_pic}', '${email}', '${password}')
  RETURNING *`

  try {
    // Fetch data from DB
    const { rows } = await db.query(finalQuery)

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
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
