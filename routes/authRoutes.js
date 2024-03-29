// Import files
import { Router } from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { jwtSecret } from '../secrets.js'

// Start app
const router = Router()

// POST route for signup
router.post('/signup', async (req, res) => {
  // Deconstruct body request
  let { first_name, last_name, profile_pic, email, password } = req.body

  // creating salt value
  const salt = await bcrypt.genSalt(10)

  // useing bcrypt to hash the password
  const hashedPassword = await bcrypt.hash(password, salt)

  // Define finalQuery to fetch data from DB
  const finalQuery =
    // Initial Query with first_name column as first_name is not nullable:
    `INSERT INTO users (first_name,` +
    // add last_name column if it is defined
    (last_name ? ` last_name,` : ``) +
    // add profile_pic column if it is defined
    (profile_pic ? ` profile_pic,` : ``) +
    // add email and password columns as they are not nullable
    ` email, password)` +
    // adding values extracted from the req.body
    `VALUES ('${first_name}',` +
    // add last name if it is defined
    (last_name ? ` '${last_name}',` : ``) +
    // add profile_pic if it is defined
    (profile_pic ? ` '${profile_pic}',` : ``) +
    // add email and hashed password
    ` '${email}', '${hashedPassword}')` +
    // return all updated rows
    `RETURNING *`

  try {
    // console.log('Final query POST authRoutes: ', finalQuery)

    // check if required values are missing
    if (!first_name || !email || !password) {
      throw new Error('First name, Email and Password can not be empty.')
    }

    // check if user already exists
    const userExists = await db.query(
      `SELECT * FROM users WHERE email = '${email}'`
    )

    // if user exists throw error
    if (userExists.rows.length) {
      throw new Error('User already exists with this email address.')
    }

    // Fetch data from DB
    const { rows } = await db.query(finalQuery)

    // throw error if db request fails
    if (!rows.length) {
      throw new Error('Failed to sign up.')
    }

    // define payload for jwt token
    const payload = {
      email: rows[0].email,
      user_id: rows[0].user_id
    }

    // create jwt token using jwt package
    const token = jwt.sign(payload, jwtSecret)

    // inserting jwt token in cookie
    res.cookie('jwt', token)

    // Send response back
    const signupResponse = {
      user_id: rows[0].user_id,
      profile_pic: rows[0].profile_pic,
      message: 'You are logged in'
    }

    res.json(signupResponse)

    // Errors
  } catch (err) {
    if (err.message.includes('unique_email')) {
      res.json({
        error: 'User already exists with this email address.'
      })
    } else res.json({ error: err.message })
  }
})

// Define a POST route for login
router.post('/login', async (req, res) => {
  // Deconstruct body request
  const { email, password } = req.body
  // Define finalQuery to fetch data from DB
  const finalQuery = `
    SELECT * FROM users 
    WHERE
    email = '${email}'
    `
  try {
    // Fetch data from DB
    const { rows } = await db.query(finalQuery)
    // Return an error if no user is found
    if (!rows.length) {
      throw new Error('Incorrect Login Credentials')
    }

    // compare saved hashed password with req.body password
    const isPasswordValid = await bcrypt.compare(password, rows[0].password)

    // throw error if password does not match with saved hashed password
    if (!isPasswordValid)
      throw new Error('Password does not match. Please try again.')

    // define payload for jwt token
    const payload = {
      email: rows[0].email,
      user_id: rows[0].user_id
    }

    // create jwt token using jwt package
    const token = jwt.sign(payload, jwtSecret)

    // inserting jwt token in cookie
    res.cookie('jwt', token)

    // Send response back
    const loginResponse = {
      user_id: rows[0].user_id,
      profile_pic: rows[0].profile_pic,
      message: 'You are logged in'
    }

    res.json(loginResponse)

    // Errors
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a Get route for logout
router.get('/logout', (req, res) => {
  // delete jwt token from cookies
  try {
    res.clearCookie('jwt')

    // return a success message
    res.json({ message: 'You are logged out' })
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Export the router
export default router
