import express from 'express'
import swaggerUi from 'swagger-ui-express'
import * as swaggerDocument from './swagger.json'
import dotenv from 'dotenv'

dotenv.config()
const app = express()

app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const PORT = process.env.PORT ?? 3000

console.log(PORT)
console.log(process.env.PORT)
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) })
