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
router.get('/photos/:photoId', async (req, res) => {
  const { photoId } = req.params
  try {
    const { rows } = await db.query(
      `SELECT * FROM house_pics WHERE house_pic_id = ${photoId}`
    )
    console.log('Rows in photos: ', rows)
    if (!rows.length || rows.length == 0) {
      throw new Error('Photo Id not found.')
    }
    console.log('Rows in photos: ', rows)

    res.json(rows[0])
  } catch (err) {
    res.json({ err: err.message })
  }
})

export default router
