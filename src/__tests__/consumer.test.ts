import { sendMessage } from '../publisher'
import { consumeMessages } from '../consumer'

// Mocking dotenv to set environment variables for testing
jest.mock('dotenv', () => ({
  config: jest.fn()
}))

describe('Messaging Scenario', () => {
  beforeAll(() => {
    process.env.RABBIT_MQ_URL = 'amqp://localhost'
  })

  it('should send and consume a message', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = 'Test message'
    const apiKey = 'test_api_key'

    // Set up a consumer to listen for messages
    await consumeMessages(exchange, routingKey, apiKey) // Await the consumeMessages call

    // Wait for the consumer to establish connection and set up the queue
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Send a message from the publisher
    await sendMessage(exchange, routingKey, message, apiKey)

    // Allow some time for the message to be consumed
    await new Promise(resolve => setTimeout(resolve, 500))
  }, 5000) // Increase timeout if needed
})
