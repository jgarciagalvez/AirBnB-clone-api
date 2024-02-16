import { Router } from 'express'
import db from '../db.js'

const router = Router()

// Fetch all photos
router.get('/photos', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM house_pics')
    res.json(rows)
  } catch (err) {
    res.json(err)
  }
})

// Fetch photos with index of 1
router.get('/photos/2', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM house_pics WHERE house_pic_id = 2'
    )
    res.json(rows[0])
  } catch (err) {
    res.json(err)
  }
})

export default router
