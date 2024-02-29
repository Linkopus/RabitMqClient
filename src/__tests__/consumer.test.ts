import { sendMessage } from '../publisher'
import { consumeMessages } from '../consumer'

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

  it('should send and consume two messages with two consumers', async () => {
    const exchange = 'test_exchange'
    const routingKey1 = 'test_routing_key_1'
    const routingKey2 = 'test_routing_key_2'
    const message1 = '1'
    const message2 = '2'
    const apiKey = 'test_api_key'

    // Start consuming messages for consumer 1
    const consumePromise1 = consumeMessages(exchange, routingKey1, apiKey)

    // Start consuming messages for consumer 2
    const consumePromise2 = consumeMessages(exchange, routingKey2, apiKey)

    // Wait for consumers to be ready
    await Promise.all([
      consumePromise1,
      consumePromise2
    ])

    // Send message 1
    await sendMessage(exchange, routingKey1, message1, apiKey)

    // Send message 2
    await sendMessage(exchange, routingKey2, message2, apiKey)

    // Wait for both messages to be consumed
    await Promise.all([
      consumePromise1,
      consumePromise2
    ])
  })

  it('should send and have two consumers consume the same message simultaneously', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = 'Hello, world!'
    const apiKey = 'test_api_key'

    // Start consuming messages for consumer 1
    const consumePromise1 = consumeMessages(exchange, routingKey, apiKey)

    // Start consuming messages for consumer 2
    const consumePromise2 = consumeMessages(exchange, routingKey, apiKey)

    // Wait for consumers to be ready
    await Promise.all([
      consumePromise1,
      consumePromise2
    ])

    // Send message
    await sendMessage(exchange, routingKey, message, apiKey)

    // Wait for both consumers to consume the message
    await Promise.all([
      consumePromise1,
      consumePromise2
    ])
  })
  it('should send and have two consumers consume messages in round-robin fashion', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = 'Hello, world!'
    const apiKey = 'test_api_key'

    // Start consuming messages for consumer 1
    const consumePromise1 = consumeMessages(exchange, routingKey, apiKey)

    // Start consuming messages for consumer 2
    const consumePromise2 = consumeMessages(exchange, routingKey, apiKey)

    // Wait for consumers to be ready
    await Promise.all([
      consumePromise1,
      consumePromise2
    ])

    // Send two messages in succession
    await sendMessage(exchange, routingKey, message + '1', apiKey)
    await sendMessage(exchange, routingKey, message + '2', apiKey)

    // Wait for both consumers to consume the messages
    await Promise.all([
      consumePromise1,
      consumePromise2
    ])
  })
})
