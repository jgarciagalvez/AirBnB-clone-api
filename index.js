// Packages
import express from 'express'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

// Modules
import userRouter from './routes/usersRoutes.js'
import housesRouter from './routes/housesRoutes.js'
import reviewsRouter from './routes/reviewsRoutes.js'
import bookingsRouter from './routes/bookingsRoutes.js'
import photosRouter from './routes/photosRoutes.js'
import authRouter from './routes/authRoutes.js'

// Start app
const app = express()

// Middleware to parse JSON bodies
app.use(express.json())
app.use(cookieParser())

// Use routes
app.use(userRouter)
app.use(housesRouter)
app.use(reviewsRouter)
app.use(bookingsRouter)
app.use(photosRouter)
app.use(authRouter)

// Start server
app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})
