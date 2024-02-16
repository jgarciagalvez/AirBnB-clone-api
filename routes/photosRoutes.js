import { Router } from 'express'

const router = Router()

// dummy data
const photos = [
  {
    id: 1,
    user_id: 1,
    house_id: 1,
    url: 'https://randomuser.me/api/portraits/men/90.jpg'
  },
  {
    id: 2,
    user_id: 2,
    house_id: 2,
    url: 'https://randomuser.me/api/portraits/men/90.jpg'
  },
  {
    id: 3,
    user_id: 3,
    house_id: 3,
    url: 'https://randomuser.me/api/portraits/men/90.jpg'
  }
]

// Fetch all photos
router.get('/photos', (req, res) => {
  res.json(photos)
})

// Fetch photos with index of 1
router.get('/photos/1', (req, res) => {
  res.json(photos[1])
})

export default router
