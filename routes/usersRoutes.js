import { Router } from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const jwtSecret = process.env.JWTSECRET

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

// /profile - Fetch user data using user_id from jwt token
router.get('/profile', async (req, res) => {
  try {
    // Validate token
    if (!req.cookies.jwt) {
      throw new Error('No authorisation token found')
    }
    let token = req.cookies.jwt
    const { user_id } = jwt.verify(token, jwtSecret)

    // Fetch data
    const { rows } = await db.query(`
      SELECT user_id, first_name, last_name, profile_pic, email
      FROM users WHERE user_id = ${user_id}
    `)
    if (!rows.length) {
      throw new Error('User Id not found.')
    }
    res.json(rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

router.patch('/profile', async (req, res) => {
  try {
    // Validate token
    if (!req.cookies.jwt) {
      throw new Error('No authorisation token found')
    }
    let token = req.cookies.jwt
    const { user_id } = jwt.verify(token, jwtSecret)

    // Deconstructing fields from request
    const { first_name, last_name, email, password, profile_pic } = req.body

    // Declare initial query
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
      // creating salt value
      const salt = await bcrypt.genSalt(10)

      // useing bcrypt to hash the password
      const hashedPassword = await bcrypt.hash(password, salt)

      finalQuery +=
        first_name || last_name || email || password
          ? `, password = '${hashedPassword}'`
          : ` password = '${hashedPassword}'`
    }

    // if profile_pic exists in req.body, update db profile_pic
    if (profile_pic) {
      finalQuery +=
        first_name || last_name || email || password
          ? `, profile_pic = '${profile_pic}'`
          : ` profile_pic = '${profile_pic}'`
    }

    // add last final query
    finalQuery += ` WHERE user_id = ${user_id}
  RETURNING *`

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
