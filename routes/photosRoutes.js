import { Router } from 'express'
import db from '../db.js'

const router = Router()

// house_pics_id serial PRIMARY KEY,
// house_id INT REFERENCES houses(house_id) NOT NULL,
// url VARCHAR(255) NOT NULL

// POST request for photos:
router.post('/photos', async (req, res) => {
  const { house_id, url } = req.body

  const finalQuery = `INSERT INTO house_pics (house_id, url)
  VALUES (${house_id}, '${url}')
  RETURNING *`
  try {
    // console.log('Final Query for post photos: ', finalQuery)

    const { rows } = await db.query(finalQuery)

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Fetch all photos
router.get('/photos', async (req, res) => {
  const { house_id } = req.query

  try {
    if (!house_id) {
      throw new Error('house parameter is required')
    }
    const { rows } = await db.query(
      `SELECT * FROM house_pics WHERE house_id = ${house_id}`
    )
    if (!rows.length) {
      throw new Error('No house or house photos found.')
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Fetch photos with index of 1
router.get('/photos/:photoId', async (req, res) => {
  const { photoId } = req.params
  try {
    const { rows } = await db.query(
      `SELECT * FROM house_pics WHERE house_pic_id = ${photoId}`
    )
    // console.log('Rows in photos: ', rows)
    if (!rows.length || rows.length == 0) {
      throw new Error('Photo Id not found.')
    }
    // console.log('Rows in photos: ', rows)

    res.json(rows[0])
  } catch (err) {
    res.json({ err: err.message })
  }
})

// PATCH ROUTE - Update photo
router.patch('/photos/:photoId', async (req, res) => {
  const { photoId } = req.params
  const { url } = req.body
  try {
    const { rows } = await db.query(
      `UPDATE house_pics SET url = '${url}' WHERE house_pic_id = ${photoId} RETURNING *`
    )
    if (!rows.length) {
      throw new Error('Photo Id not found.')
    }

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// DELETE ROUTE - Delete photo
router.delete('/photos/:photoId', async (req, res) => {
  const { photoId } = req.params
  try {
    const { rows } = await db.query(
      `DELETE FROM house_pics WHERE house_pic_id = ${photoId} RETURNING *`
    )
    if (!rows.length) {
      throw new Error('Photo Id not found.')
    }

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
