import { Router } from 'express'

const router = Router()

// Fetch all users
router.get('/users', (req, res) => {
  res.json([
    { id: 1, firstName: 'Alice' },
    { id: 2, firstName: 'Bob' }
  ])
})

// Fetch user by userID
router.get('/users/1', (req, res) => {
  res.json({ id: 1, firstName: 'Alice' })
})

export default router
