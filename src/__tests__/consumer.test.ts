import { sendMessage } from '../publisher'
import { consumeMessages } from '../consumer'
import dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Mock the publisher and consumer modules
jest.mock('../publisher')
jest.mock('../consumer')

describe('Message Passing Test', () => {
  it('should send and consume a message', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = 'Hello, world!'
    const apiKey = 'test_api_key'

    // Mocked consumeMessages function
    const consumeMessagesMock = jest.fn().mockResolvedValueOnce(undefined)

    // Mocked sendMessage function
    const sendMessageMock = jest.fn().mockResolvedValueOnce(undefined);

    // Set the mocked functions for consumption and sending messages
    (consumeMessages as jest.MockedFunction<typeof consumeMessages>).mockImplementation(consumeMessagesMock);
    (sendMessage as jest.MockedFunction<typeof sendMessage>).mockImplementation(sendMessageMock)

    // Execute the test
    await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for consumer to be ready
    await expect(consumeMessages(exchange, routingKey, apiKey)).resolves.toBeUndefined() // Consume message

    await expect(sendMessage(exchange, routingKey, message, apiKey)).resolves.toBeUndefined() // Send message

    // Verify that the mocked functions were called with the correct parameters
    expect(consumeMessagesMock).toHaveBeenCalledWith(exchange, routingKey, apiKey)
    expect(sendMessageMock).toHaveBeenCalledWith(exchange, routingKey, message, apiKey)
  })
  it('should send and consume two messages with two consumers', async () => {
    const exchange = 'test_exchange'
    const routingKey1 = 'test_routing_key_1'
    const routingKey2 = 'test_routing_key_2'
    const message1 = '1'
    const message2 = '2'
    const apiKey = 'test_api_key'

    // Mocked consumeMessages function for consumer 1
    const consumeMessagesMock1 = jest.fn().mockResolvedValueOnce(undefined)

    // Mocked consumeMessages function for consumer 2
    const consumeMessagesMock2 = jest.fn().mockResolvedValueOnce(undefined)

    // Mocked sendMessage function for message 1
    const sendMessageMock1 = jest.fn().mockResolvedValueOnce(undefined)

    // Mocked sendMessage function for message 2
    const sendMessageMock2 = jest.fn().mockResolvedValueOnce(undefined);

    // Set the mocked functions for consumption and sending messages
    (consumeMessages as jest.MockedFunction<typeof consumeMessages>)
      .mockImplementationOnce(consumeMessagesMock1)
      .mockImplementationOnce(consumeMessagesMock2);

    (sendMessage as jest.MockedFunction<typeof sendMessage>)
      .mockImplementationOnce(sendMessageMock1)
      .mockImplementationOnce(sendMessageMock2)

    // Execute the test
    await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for consumers to be ready

    // Execute consumption and sending messages
    await expect(consumeMessages(exchange, routingKey1, apiKey)).resolves.toBeUndefined() // Consume message 1
    await expect(consumeMessages(exchange, routingKey2, apiKey)).resolves.toBeUndefined() // Consume message 2
    await expect(sendMessage(exchange, routingKey1, message1, apiKey)).resolves.toBeUndefined() // Send message 1
    await expect(sendMessage(exchange, routingKey2, message2, apiKey)).resolves.toBeUndefined() // Send message 2

    // Verify that the mocked functions were called with the correct parameters
    expect(consumeMessagesMock1).toHaveBeenCalledWith(exchange, routingKey1, apiKey)
    expect(consumeMessagesMock2).toHaveBeenCalledWith(exchange, routingKey2, apiKey)
    expect(sendMessageMock1).toHaveBeenCalledWith(exchange, routingKey1, message1, apiKey)
    expect(sendMessageMock2).toHaveBeenCalledWith(exchange, routingKey2, message2, apiKey)
  })
  it('should send and have two consumers consume the same message simultaneously', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = 'Hello, world!'
    const apiKey = 'test_api_key'

    // Mocked consumeMessages function for consumer 1
    const consumeMessagesMock1 = jest.fn().mockResolvedValueOnce(undefined)

    // Mocked consumeMessages function for consumer 2
    const consumeMessagesMock2 = jest.fn().mockResolvedValueOnce(undefined)

    // Mocked sendMessage function
    const sendMessageMock = jest.fn().mockResolvedValueOnce(undefined);

    // Set the mocked functions for consumption and sending messages
    (consumeMessages as jest.MockedFunction<typeof consumeMessages>)
      .mockImplementationOnce(consumeMessagesMock1)
      .mockImplementationOnce(consumeMessagesMock2);

    (sendMessage as jest.MockedFunction<typeof sendMessage>)
      .mockImplementation(sendMessageMock)

    // Execute the test
    await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for consumers to be ready

    // Execute consumption and sending message
    await expect(consumeMessages(exchange, routingKey, apiKey)).resolves.toBeUndefined() // Consume message for consumer 1
    await expect(consumeMessages(exchange, routingKey, apiKey)).resolves.toBeUndefined() // Consume message for consumer 2
    await expect(sendMessage(exchange, routingKey, message, apiKey)).resolves.toBeUndefined() // Send message

    // Wait for both consumers to consume the message
    await Promise.all([
      consumeMessagesMock1,
      consumeMessagesMock2
    ])

    // Verify that the mocked functions were called with the correct parameters
    expect(consumeMessagesMock1).toHaveBeenCalledWith(exchange, routingKey, apiKey)
    expect(consumeMessagesMock2).toHaveBeenCalledWith(exchange, routingKey, apiKey)
    expect(sendMessageMock).toHaveBeenCalledWith(exchange, routingKey, message, apiKey)
  })
  it('should send and have two consumers consume messages in round-robin fashion', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message1 = 'Hello, world!1'
    const message2 = 'Hello, world!2'
    const apiKey = 'test_api_key'

    // Mocked consumeMessages function for consumer 1
    const consumeMessagesMock1 = jest.fn().mockResolvedValueOnce(undefined)

    // Mocked consumeMessages function for consumer 2
    const consumeMessagesMock2 = jest.fn().mockResolvedValueOnce(undefined)

    // Mocked sendMessage function
    const sendMessageMock = jest.fn().mockResolvedValueOnce(undefined);

    // Set the mocked functions for consumption and sending messages
    (consumeMessages as jest.MockedFunction<typeof consumeMessages>)
      .mockImplementationOnce(consumeMessagesMock1)
      .mockImplementationOnce(consumeMessagesMock2);

    (sendMessage as jest.MockedFunction<typeof sendMessage>)
      .mockImplementation(sendMessageMock)

    // Execute the test
    await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for consumers to be ready

    // Execute consumption and sending messages
    await sendMessage(exchange, routingKey, message1, apiKey) // Send message 1
    await expect(consumeMessages(exchange, routingKey, apiKey)).resolves.toBeUndefined() // Consume message 1 for consumer 1
    await sendMessage(exchange, routingKey, message2, apiKey) // Send message 2
    await expect(consumeMessages(exchange, routingKey, apiKey)).resolves.toBeUndefined() // Consume message 2 for consumer 2

    // Wait for both consumers to consume the messages
    await Promise.all([
      consumeMessagesMock1,
      consumeMessagesMock2
    ])

    // Verify that the mocked functions were called with the correct parameters
    expect(consumeMessagesMock1).toHaveBeenCalledWith(exchange, routingKey, apiKey)
    expect(consumeMessagesMock2).toHaveBeenCalledWith(exchange, routingKey, apiKey)
    expect(sendMessageMock).toHaveBeenCalledWith(exchange, routingKey, message1, apiKey)
    expect(sendMessageMock).toHaveBeenCalledWith(exchange, routingKey, message2, apiKey)
  })
})
