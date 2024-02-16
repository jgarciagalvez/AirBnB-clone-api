// Import necessary files
import { Router } from 'express'
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
router.get('/login', (req, res) => {
  res.json(userdata)
})

// Define a Get route for login
router.get('/logout', (req, res) => {
  res.json(userdata)
})

// Export the router
export default router
