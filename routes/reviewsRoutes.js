import { Router } from 'express'
import router from './usersRoutes'
const router = router()

// Define a GET route for fetching all reviews
router.get('/reviews', (req, res) => {
  res.json([
    { review_id: 1, house_id: 1, review_text: 'Great place to stay' },
    { review_id: 2, house_id: 1, review_text: 'Awesome' }
  ])
})

// Define a GET route to get a single review
router.get('/reviews/1', (req, res) => {
  res.json([{ review_id: 1, house_id: 1, review_text: 'Great place to stay' }])
})

export default router
