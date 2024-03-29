// Import files
import { Router } from 'express'
import db from '../db.js'
const jwtSecret = process.env.JWTSECRET
import jwt from 'jsonwebtoken'

// Create router
const router = Router()

// POST request route for creating houses
router.post('/houses', async (req, res) => {
  try {
    // deconstructing req.body to get listing data
    const { location, bedrooms, bathrooms, price_per_night, description } =
      req.body

    // getting the jwt token from cookies
    let token = req.cookies.jwt

    // if token does not exist or is not valid, throw error
    if (!token) {
      throw new Error('Invalid authentication token')
    }

    // deconstructing user_id from the jwt token in cookies
    const { user_id } = jwt.verify(token, jwtSecret)

    // if user_id is not found throw error
    if (!user_id) {
      throw new Error('Invalid authentication token')
    }

    // final query that will be sent to db
    const finalQuery = `INSERT INTO houses (location, bedrooms, bathrooms, price_per_night, description, host_id)
  VALUES ('${location}', ${bedrooms}, ${bathrooms}, ${price_per_night}, '${description}', ${user_id})
  RETURNING *
  `

    const { rows } = await db.query(finalQuery)

    if (!rows.length)
      throw new Error('Error creating the listing, please try again.')

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// GET ROUTES
// Define a Get route for fetching the list of locations
router.get('/locations', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT DISTINCT location FROM houses')
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a Get route for fetching the list of houses
router.get('/houses', async (req, res) => {
  try {
    // Create Query String to get data from db
    let finalQueryStr = 'SELECT * FROM houses'
    // Define Arrays to save query elements and complete query
    let filterQuery = []
    let sortQuery = []

    // Build Filter Query with URL query parametes
    // location (exact match)
    if (req.query.location) {
      filterQuery.push(`location = '${req.query.location}'`)
    }
    // max_price (price equal to or lower than)
    if (req.query.max_price) {
      filterQuery.push(`price_per_night <= ${req.query.max_price}`)
    }
    // min_rooms (rooms equal to or greater than)
    if (req.query.min_rooms) {
      filterQuery.push(`bedrooms >= ${req.query.min_rooms}`)
    }
    // search (fuzzy search anywhere in the description)
    if (req.query.search) {
      filterQuery.push(`description ILIKE '%${req.query.search}%'`)
    }
    // End of Filter Queries

    // Sorting Query - Get field to sort by + order
    if (req.query.sort) {
      sortQuery.push(`ORDER BY ${req.query.sort}`)
      if (req.query.order) {
        sortQuery.push(`${req.query.order}`)
      }
    }

    // Build Query for the database using the elements of the array
    // Adds the filter query (if any) to the finalQueryStr
    if (filterQuery.length) {
      finalQueryStr += ' WHERE ' + filterQuery.join(' AND ')
    }

    // Adds the sort query (if any) to the finalQueryStr
    if (sortQuery.length) {
      finalQueryStr += ' ' + sortQuery.join(' ')
    }

    // Fetch data from the database using the finalQueryStr
    const { rows } = await db.query(finalQueryStr)
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a Get route for fetching individual house
router.get('/houses/:house_id', async (req, res) => {
  let house_id = req.params.house_id
  try {
    const { rows } = await db.query(
      `SELECT * FROM houses WHERE house_id = ${house_id}`
    )
    if (!rows.length) {
      throw new Error('Property not found')
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// PATCH ROUTE - Update a house based on Payload from PATCH request
router.patch('/houses/:house_id', async (req, res) => {
  // UPDATE Database
  try {
    // Deconstruct body of the PATCH request
    const { location, bedrooms, bathrooms, price_per_night, description } =
      req.body
    const { house_id } = req.params

    // Create BASE Query String to UPDATE data in db
    let finalQueryStr = 'UPDATE houses'
    // Define Array to save SET query elements and complete query
    let setQuery = []

    // Build setQuery with payload from the patch request
    if (location) {
      setQuery.push(`location = '${location}'`)
    }
    if (bedrooms) {
      setQuery.push(`bedrooms = ${bedrooms}`)
    }
    if (bathrooms) {
      setQuery.push(`bathrooms = ${bathrooms}`)
    }
    if (price_per_night) {
      setQuery.push(`price_per_night = ${price_per_night}`)
    }
    if (description) {
      setQuery.push(`description = '${description}'`)
    }

    // Build the final UPDATE Query using the elements of the array
    if (setQuery.length) {
      finalQueryStr +=
        ' SET ' +
        setQuery.join(', ') +
        ` WHERE house_id = ${house_id} RETURNING *`
    } else {
      throw new Error('Please provide valid fields to update')
    }

    // getting the jwt token from cookies
    let token = req.cookies.jwt

    // if token does not exist or is not valid, throw error
    if (!token) {
      throw new Error('Invalid authentication token')
    }

    // deconstructing user_id from the jwt token in cookies
    const { user_id } = jwt.verify(token, jwtSecret)

    // if user_id is not found throw error
    if (!user_id) {
      throw new Error('Invalid authentication token')
    }

    // authorization check to see if host_id matches the user_id from jwt token
    const houseObj = await db.query(
      `SELECT * FROM houses WHERE house_id = ${house_id}`
    )

    if (!houseObj.rows.length) throw new Error('House Id not found.')

    // get host_id from response
    const host_id = houseObj.rows[0].host_id

    // throw new error if user_id does not match host_id from db
    if (host_id !== user_id) throw new Error('You are not authorized')

    const { rows } = await db.query(finalQueryStr)
    if (!rows.length) {
      throw new Error('There was an error with the update')
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// DELETE ROUTE
// Define a route for deleting individual house
router.delete('/houses/:house_id', async (req, res) => {
  try {
    let house_id = req.params.house_id
    // getting the jwt token from cookies
    let token = req.cookies.jwt

    // if token does not exist or is not valid, throw error
    if (!token) {
      throw new Error('Invalid authentication token')
    }

    // deconstructing user_id from the jwt token in cookies
    const { user_id } = jwt.verify(token, jwtSecret)

    // if user_id is not found throw error
    if (!user_id) {
      throw new Error('Invalid authentication token')
    }

    // authorization check to see if host_id matches the user_id from jwt token
    const houseObj = await db.query(
      `SELECT * FROM houses WHERE house_id = ${house_id}`
    )

    // Checking if house with that ID exits
    if (!houseObj.rows.length) throw new Error('House Id not found.')

    // get host_id from response
    const host_id = houseObj.rows[0].host_id

    // throw new error if user_id does not match host_id from db
    if (host_id !== user_id) throw new Error('You are not authorized')

    const { rows } = await db.query(
      `DELETE FROM houses WHERE house_id = ${house_id} RETURNING *`
    )
    if (!rows.length) {
      throw new Error('Property not found')
    }
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Export the router
export default router
