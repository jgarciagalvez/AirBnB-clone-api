// Import files
import { Router } from 'express'
import db from '../db.js'

// Start the app
const router = Router()

// Get user data

const userdata = [
  { user_id: 1, username: 'john@mail.com', password: 1234 },
  { user_id: 2, username: 'mary@mail.com', password: 56789 }
]

// Define a Get route for signup
router.get('/signup', (req, res) => {
  res.json(userdata)
})

// Define a Get route for login
router.post('/login', async (req, res) => {
  let query = `
    SELECT * FROM users 
    WHERE
    email = '${req.body.email}'
    AND password = '${req.body.password}'
    `
  console.log(query)
  try {
    const { rows } = await db.query(query)
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
