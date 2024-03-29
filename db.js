// db.js
import pg from 'pg'

const { Pool } = pg

// Database connection parameters
const db = new Pool({
  ssl: {
    rejectUnauthorized: false
  },
  connectionString: process.env.DBURL
})

export default db
