import { Router } from 'express'

const router = Router()

router.get('/users', (req, res) => {
  res.send([
    { id: 1, firstName: 'Alice' },
    { id: 2, firstName: 'Bob' }
  ])
})

router.get('/users/1', (req, res) => {
  res.send({ id: 1, firstName: 'Alice' })
})

export default router
