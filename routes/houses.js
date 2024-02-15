// Import necessary files
import { Router } from 'express'
const router = Router()

// Define a Get route for fetching the list of houses
router.get('/houses', (req, res) => {
  res.json([{ id: 1, location: 'Koh Phangan', rooms: 4 }])
})

// Export the router
export default router
