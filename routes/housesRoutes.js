// Import files
import { Router } from 'express'
import db from '../db.js'

// Create router
const router = Router()

// POST request route for creating houses
router.post('/houses', async (req, res) => {
  const {
    location,
    bedrooms,
    bathrooms,
    price_per_night,
    description,
    host_id
  } = req.body

  const finalQuery = `INSERT INTO houses (location, bedrooms, bathrooms, price_per_night, description, host_id)
  VALUES ('${location}', ${bedrooms}, ${bathrooms}, ${price_per_night}, '${description}', ${host_id})
  RETURNING *
  `

  try {
    const { rows } = await db.query(finalQuery)

    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a Get route for fetching the list of houses
router.get('/houses', async (req, res) => {
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
  try {
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

// Export the router
export default router
