// Import Express
import express from 'express'
import userRouter from './routes/usersRoutes.js'
import housesRouter from './routes/housesRoutes.js'
import reviewsRouter from './routes/reviewsRoutes.js'
import bookingsRouter from './routes/bookingsRoutes.js'
import photosRouter from './routes/photosRoutes.js'

const app = express()

app.use(userRouter)
app.use(housesRouter)
app.use(reviewsRouter)

app.use(bookingsRouter)
app.use(photosRouter)

app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})
