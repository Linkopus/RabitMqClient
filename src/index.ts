import express from 'express'

const app = express()

app.use(express.json())
export { sendMessage } from './publisher'
export { consumeMessages } from './consumer'
