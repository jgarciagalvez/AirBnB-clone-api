import { Router } from 'express'

const router = Router()

// dummy data
const bookings = [
  {
    id: 1,
    user_id: 1,
    house_id: 1,
    check_in: '2024/02/20 11:12:14',
    check_out: '2024/02/23 19:14:02',
    total_price: '145',
    booked_on: '2024/01/20 11:12:14'
  },
  {
    id: 2,
    user_id: 2,
    house_id: 2,
    check_in: '2024/02/03 11:10:35',
    check_out: '2024/02/16 14:09:01',
    total_price: '412',
    booked_on: '2024/01/03 11:10:35'
  },
  {
    id: 3,
    user_id: 3,
    house_id: 3,
    check_in: '2024/02/09 07:45:03',
    check_out: '2024/02/15 20:52:44',
    total_price: '302',
    booked_on: '2024/01/09 07:45:03'
  }
]

// Fetch all bookings
router.get('/bookings', (req, res) => {
  res.json(bookings)
})

// Fetch bookings with index of 1
router.get('/bookings/1', (req, res) => {
  res.json(bookings[1])
})

export default router
