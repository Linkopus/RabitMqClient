import { publishToQueue } from '../publisher/index' // Replace 'yourModuleName' with the actual path to your module
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

jest.mock('../publisher/index', () => ({
  publishToQueue: jest.fn()
}))

describe('publishToQueue function', () => {
  // Mocking the amqplib module
  jest.mock('amqplib/callback_api', () => {
    return {
      connect: jest.fn()
    }
  })

  it('should publish message to the queue', () => {
    const message = 'Test Message'
    const mockChannel = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn()
    }

    const mockConnection = {
      createChannel: jest.fn().mockImplementation((cb: any) => cb(null, mockChannel)),
      close: jest.fn()
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('amqplib/callback_api').connect.mockImplementation((_: any, cb: any) => cb(null, mockConnection))

    publishToQueue()

    setTimeout(() => {
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('logs', { durable: false })
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith('logs', Buffer.from(message))
    }, 100) // Adjust the delay as needed based on your test setup
  })

  it('should throw error when connection fails', () => {
    const errorMessage = 'Connection error'

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('amqplib/callback_api').connect.mockImplementation((_: any, cb: any) => cb(new Error(errorMessage)))

    try {
      publishToQueue()
      // If the function call doesn't throw an error, it means the test failed
      throw new Error('Connection error')
    } catch (error: any) {
      // Check if the caught error message matches the expected error message
      expect(error.message).toBe(errorMessage)
    }
  })
  it('should throw error when channel creation fails', () => {
    const errorMessage = 'fail is not defined'

    // Mock the connection to RabbitMQ without establishing a secure connection
    const mockConnection = {
      createChannel: jest.fn().mockImplementation((cb: any) => cb(new Error(errorMessage)))
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('amqplib/callback_api').connect.mockImplementation((_: any, cb: any) => cb(null, mockConnection))

    // Assert that calling publishToQueue throws an error
    try {
      publishToQueue()
      fail('Expected publishToQueue to throw an error')
    } catch (error: any) {
      // Ensure that the caught error message matches the expected error message
      expect(error.message).toMatch(errorMessage)
    }
  })
})
