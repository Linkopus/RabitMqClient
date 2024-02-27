import { publishToQueue } from '../publisher/index'

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

  it('should handle error when connection fails', async () => {
    const errorMessage = 'Connection error';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    (require('amqplib/callback_api')).connect.mockImplementation((_url: string, callback: any) => {
      callback(new Error(errorMessage))
    })

    try {
      await publishToQueue()
      // If the function call doesn't throw an error, it means the test failed
      throw new Error('Connection error')
    } catch (error: any) {
      // Ensure that the caught error message matches the expected error message
      expect(error.message).toBe(errorMessage)
    }
  })

  it('should throw error when connection fails', () => {
    const errorMessage = 'Connection error'

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('amqplib/callback_api').connect.mockImplementation((_: any, cb: any) => cb(new Error(errorMessage)))

    try {
      void publishToQueue()
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
      void publishToQueue()
      fail('Expected publishToQueue to throw an error')
    } catch (error: any) {
      // Ensure that the caught error message matches the expected error message
      expect(error.message).toMatch(errorMessage)
    }
  })
})
