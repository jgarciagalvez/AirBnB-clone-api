import { Router } from 'express'
import db from '../db.js'

const router = Router()

// Fetch all users
// router.get('/users', (req, res) => {
//   res.json([
//     { id: 1, firstName: 'Alice' },
//     { id: 2, firstName: 'Bob' }
//   ])
// })

// Fetch all users
router.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users')
    res.json(rows)
  } catch (err) {
    res.json(err)
  }
})

// Fetch user by userID
router.get('/users/1', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE user_id = 1')
    res.json(rows[0])
  } catch (err) {
    res.json(err)
  }
})

export default router
