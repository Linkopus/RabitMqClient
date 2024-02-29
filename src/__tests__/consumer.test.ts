import { sendMessage } from '../publisher'
import { consumeMessages } from '../consumer'
import dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

describe('Message Passing Test', () => {
  it('should send and consume a message', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = 'Hello, world!'
    const apiKey = 'test_api_key'

    // Start consuming messages first
    const consumePromise = consumeMessages(exchange, routingKey, apiKey)

    // Wait for consumer to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Adjust timeout as needed

    // Send message
    await sendMessage(exchange, routingKey, message, apiKey)

    // Wait for message consumption
    await consumePromise
  })
})
