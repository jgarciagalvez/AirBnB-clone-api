// Import necessary files
import { Router } from 'express'
import db from '../db.js'

// Get user data
const router = Router()

const userdata = [
  { user_id: 1, username: 'john@mail.com', password: 1234 },
  { user_id: 2, username: 'mary@mail.com', password: 56789 }
]

// user_id serial PRIMARY KEY,
// 	first_name VARCHAR(50) NOT NULL,
// 	last_name VARCHAR(50),
// 	profile_pic VARCHAR(255),
// 	email VARCHAR(50) NOT NULL,
// 	password VARCHAR(50) NOT NULL
// user_id, first_name, last_name, profile_pic, email, password

// Define a Get route for signup
router.post('/signup', async (req, res) => {
  const { first_name, last_name, profile_pic, email, password } = req.body

  const finalQuery = `INSERT INTO users (first_name, last_name, profile_pic, email, password)
  VALUES ('${first_name}', '${last_name}', '${profile_pic}', '${email}', '${password}')
  RETURNING *`

  try {
    // console.log('Final users post query: ', finalQuery)
    const { rows } = await db.query(finalQuery)

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a Get route for login
router.get('/login', (req, res) => {
  res.json(userdata)
})

// Define a Get route for login
router.get('/logout', (req, res) => {
  res.json(userdata)
})

// Export the router
export default router
