import express from 'express'
import userRouter from './routes/usersRoutes.js'

const app = express()

app.use(userRouter)

app.listen(4100, () => {
  console.log('Airbnb API ready on localhost:4100')
})
