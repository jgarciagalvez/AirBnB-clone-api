// Packages
import express from 'express'

// Modules
import userRouter from './routes/usersRoutes.js'
import housesRouter from './routes/housesRoutes.js'
import reviewsRouter from './routes/reviewsRoutes.js'
import bookingsRouter from './routes/bookingsRoutes.js'
import photosRouter from './routes/photosRoutes.js'

// Start app
const app = express()

// Use routes
app.use(userRouter)
app.use(housesRouter)
app.use(reviewsRouter)
app.use(bookingsRouter)
app.use(photosRouter)

// Start server
app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})
