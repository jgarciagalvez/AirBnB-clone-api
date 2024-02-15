// Import Express
import express from 'express'
import userRouter from './routes/usersRoutes.js'

const app = express()

app.use(userRouter)

// Import routes
import housesRouter from './routes/houses.js'

app.use(housesRouter)

app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})
