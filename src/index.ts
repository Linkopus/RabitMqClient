import express from 'express'
import userRoutes from './routes/userRoutes'
import connectDB from './database/db'
import swaggerUi from 'swagger-ui-express'
import * as swaggerDocument from './swagger.json'

const app = express()

connectDB().then(() => {
  console.log('Connected to MongoDB, starting server...')

  app.use(express.json())
  app.use('/', userRoutes)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  const PORT = process.env.PORT ?? 3000
  app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) })
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error)
})
