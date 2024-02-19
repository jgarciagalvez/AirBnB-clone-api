import { Router } from 'express'
import db from '../db.js'

const router = Router()

// Fetch all users
router.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users')
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Fetch user by userID
router.get('/users/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const { rows } = await db.query(
      `SELECT * FROM users WHERE user_id = ${userId}`
    )
    if (!rows.length) {
      throw new Error('User Id not found.')
    }
    res.json(rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
