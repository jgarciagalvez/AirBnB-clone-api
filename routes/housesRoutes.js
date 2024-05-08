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
    // Validate token
    if (!req.cookies.jwt) {
      throw new Error('No authorisation token found')
    }
    let token = req.cookies.jwt
    const { user_id } = jwt.verify(token, jwtSecret)

    // deconstructing req.body to get listing data
    const {
      location,
      bedrooms,
      bathrooms,
      price_per_night,
      description,
      photos
    } = req.body

    // Validations
    if (
      !location ||
      !bedrooms ||
      !bathrooms ||
      !price_per_night ||
      !description ||
      !photos
    ) {
      throw new Error(
        'location, rooms, bathrooms, price, descriptions, and photos are required'
      )
    }
    // Validate photos
    if (!Array.isArray(photos)) {
      throw new Error('photos must be an array')
    }
    if (!photos.length) {
      throw new Error('photos array cannot be empty')
    }
    if (!photos.every((p) => typeof p === 'string' && p.length)) {
      throw new Error('all photos must be strings and must not be empty')
    }

    // final query that will be sent to db
    const finalQuery = `INSERT INTO houses (location, bedrooms, bathrooms, price_per_night, description, host_id)
    VALUES ('${location}', ${bedrooms}, ${bathrooms}, ${price_per_night}, '${description}', ${user_id})
    RETURNING *`

    // Create house
    const { rows } = await db.query(finalQuery)
    if (!rows.length)
      throw new Error('Error creating the listing, please try again.')

    let house = rows[0]

    // Add photos
    let photosQuery = 'INSERT INTO house_pics (house_id, photo) VALUES '
    photos.forEach((p, i) => {
      if (i === photos.length - 1) {
        photosQuery += `(${house.house_id}, '${p}') `
      } else {
        photosQuery += `(${house.house_id}, '${p}'), `
      }
    })
    photosQuery += 'RETURNING *'

    let photosCreated = await db.query(photosQuery)

    // Compose response
    house.photo = photosCreated.rows[0].photo
    house.review_count = 0
    house.rating = 0

    // Response
    res.json(house)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// GET ROUTES
// Define a Get route for fetching the list of locations
router.get('/locations', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT DISTINCT location FROM houses')
    const locations = rows.map((row) => row.location)
    res.json(locations)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a Get route for fetching the list of houses
router.get('/houses', async (req, res) => {
  try {
    // Set initial Query String to get data from db
    let sqlQueryStr = `SELECT * FROM (SELECT DISTINCT ON (houses.house_id) houses.*, house_pics.photo 
      FROM houses LEFT JOIN house_pics ON houses.house_id = house_pics.house_id`

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
    // Adds the filter query (if any) to the sqlQueryStr
    if (filterQuery.length) {
      sqlQueryStr += ' WHERE ' + filterQuery.join(' AND ')
    }

    // Add closing string to the LEFT JOIN
    sqlQueryStr += ') AS distinct_houses'

    // Adds the sort query (if any) to the sqlQueryStr
    if (sortQuery.length) {
      sqlQueryStr += ' ' + sortQuery.join(' ')
    }

    // Fetch data from the database using the sqlQueryStr
    const { rows } = await db.query(sqlQueryStr)
    res.json(rows)

    // Errors
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
    let house = rows[0]

    // Add user info to house
    let { rows: hostRows } = await db.query(`
      SELECT user_id, profile_pic, first_name, last_name FROM
      users WHERE user_id = ${house.host_id}
    `)
    house.host = {
      user_id: hostRows[0].user_id,
      profile_pic: hostRows[0].profile_pic,
      first_name: hostRows[0].first_name,
      last_name: hostRows[0].last_name
    }

    // Add house photos
    let { rows: photosRows } = await db.query(`
      SELECT * FROM house_pics WHERE house_id = ${house.house_id}
    `)
    house.images = photosRows.map((p) => p.photo)

    // Delete host_id and send house
    delete house.host_id
    res.json(house)

    // Errors
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Define a route for editing a single house /houses/:house_id/edit
router.get('/houses/:house_id/edit', async (req, res) => {
  try {
    // Validate token
    if (!req.cookies.jwt) {
      throw new Error('No authorisation token found')
    }
    let token = req.cookies.jwt
    const { user_id } = jwt.verify(token, jwtSecret)

    // authorization check to see if host_id matches the user_id from jwt token
    const house_id = req.params.house_id

    // Fetch House
    const { rows } = await db.query(
      `SELECT * FROM houses WHERE house_id = ${house_id}`
    )
    if (!rows.length) {
      throw new Error('Property not found.')
    }

    // throw new error if user_id does not match host_id from db
    if (rows[0].host_id !== user_id)
      throw new Error('Incorrect authorisation token')

    // Declare house object
    let house = rows[0]

    // Fetch photos
    const { rows: photosRows } = await db.query(
      `SELECT * FROM house_pics WHERE house_id = ${house_id}`
    )
    house.images = photosRows.map((p) => p.photo)

    res.json(house)

    // Errors
  } catch (err) {
    res.json({ error: err.message })
  }
})

// LISTINGS ROUTE
router.get('/listings', async (req, res) => {
  try {
    // Validate token
    if (!req.cookies.jwt) {
      throw new Error('No authorisation token found')
    }
    let token = req.cookies.jwt
    const { user_id } = jwt.verify(token, jwtSecret)

    // Fetch listings
    const { rows } = await db.query(`
      SELECT * FROM (SELECT DISTINCT ON (houses.house_id) houses.*, house_pics.photo
      FROM houses LEFT JOIN house_pics ON houses.house_id = house_pics.house_id WHERE host_id = ${user_id}) AS distinct_houses
    `)
    res.json(rows)

    // Errors
  } catch (err) {
    res.json({ error: err.message })
  }
})

// PATCH ROUTE - Update a house based on Payload from PATCH request
router.patch('/houses/:house_id', async (req, res) => {
  try {
    // Validate token
    if (!req.cookies.jwt) {
      throw new Error('No authorisation token found')
    }
    let token = req.cookies.jwt
    const { user_id } = jwt.verify(token, jwtSecret)

    // authorization check to see if host_id matches the user_id from jwt token
    const { house_id } = req.params
    const response = await db.query(
      `SELECT host_id FROM houses WHERE house_id = ${house_id}`
    )
    if (!response.rows.length) {
      throw new Error('House Id not found.')
    }

    // throw new error if user_id does not match host_id from db
    if (response.rows[0].host_id !== user_id)
      throw new Error('You are not authorized')

    // Deconstruct body of the PATCH request
    const {
      location,
      bedrooms,
      bathrooms,
      price_per_night,
      description,
      photos
    } = req.body

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

    const { rows } = await db.query(finalQueryStr)
    if (!rows.length) {
      throw new Error('There was an error with the update')
    }
    let house = rows[0]

    // Update photos
    if (photos && photos.length) {
      let { rows: photosRows } = await db.query(`
        SELECT * FROM house_pics WHERE house_id = ${house_id}
      `)
      photosRows = photosRows.map((p, i) => {
        if (photos[i]) {
          p.photo = photos[i]
        }
        return p
      })
      let photosQuery = 'UPDATE house_pics SET photo = (case '
      photosRows.forEach((p, i) => {
        photosQuery += `when house_pics_id = ${p.id} then '${p.photo}' `
      })
      photosQuery += 'end) WHERE house_pics_id in ('
      photosRows.forEach((p, i) => {
        photosQuery += `${p.id}, `
      })
      photosQuery = photosQuery.slice(0, -2)
      photosQuery += ') RETURNING *'
      const { rows: updatedPhotos } = await db.query(photosQuery)
      house.images = updatedPhotos.map((p) => p.photo)
    }
    res.json(house)

    // Errors
  } catch (err) {
    res.json({ error: err.message })
  }
})

// DELETE ROUTE
// Define a route for deleting individual house
router.delete('/houses/:house_id', async (req, res) => {
  try {
    let house_id = req.params.house_id
    // Validate token
    if (!req.cookies.jwt) {
      throw new Error('No authorisation token found')
    }
    let token = req.cookies.jwt
    const { user_id } = jwt.verify(token, jwtSecret)

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
