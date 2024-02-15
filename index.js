// Import Express
import express from 'express'
import userRouter from './routes/usersRoutes.js'
import housesRouter from './routes/houses.js'
import bookingsRouter from './routes/bookingsRoutes.js'

const app = express()

app.use(userRouter)
app.use(housesRouter)

app.use(bookingsRouter)

app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})
