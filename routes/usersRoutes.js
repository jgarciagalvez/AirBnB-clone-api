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

router.patch('/users/:user_id', async (req, res) => {
  const userId = req.params.user_id
  const { first_name, last_name, email, password, profile_pic } = req.body

  // initial query
  let finalQuery = `UPDATE users
  SET`

  // if first_name exists in req.body, update db first_name - check if anything else has been defined before.
  if (first_name) finalQuery += ` first_name = '${first_name}'`

  // if last_name exists in req.body, update db last_name
  if (last_name) {
    finalQuery +=
      first_name || last_name || email || password
        ? `, last_name = '${last_name}'`
        : ` last_name = '${last_name}'`
  }

  // if email exists in req.body, update db email
  if (email) {
    finalQuery +=
      first_name || last_name || email || password
        ? `, email = '${email}'`
        : ` email = '${email}'`
  }

  // if password exists in req.body, update db password
  if (password) {
    finalQuery +=
      first_name || last_name || email || password
        ? `, password = '${password}'`
        : ` password = '${password}'`
  }

  // if profile_pic exists in req.body, update db profile_pic
  if (profile_pic) {
    finalQuery +=
      first_name || last_name || email || password
        ? `, profile_pic = '${profile_pic}'`
        : ` profile_pic = '${profile_pic}'`
  }

  // add last final query
  finalQuery += ` WHERE user_id = ${userId}
  RETURNING *`

  try {
    console.log('Final POST query for usersRoutes', finalQuery)

    // deconstructed rows from the db response object
    const { rows } = await db.query(finalQuery)

    if (!rows.length) {
      throw new Error('No user found or error in updating')
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
