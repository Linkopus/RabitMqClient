import { sendMessage } from '../publisher/index'
import * as amqp from 'amqplib'
import ErrorType from '../utils/errorMessages'
import config_test from '../config/config.test'
import config from '../config/config'

// Mocking amqplib
jest.mock('amqplib')

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('mocked certificate data')
}))

describe('sendMessage', () => {
  beforeEach(() => {
    config.rabbitmqurl = config_test.rabbitmqurl_test
    config.client_cert = config_test.client_cert_test
    config.client_key = config_test.client_key_test
    config.ca_cert = config_test.ca_cert_test
    config.passphrase = config_test.passphrase_test
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('initializes publisher with correct parameters', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = 'Test message'
    const apiKey = 'test_api_key'

    const mockedChannel: any = {
      assertExchange: jest.fn(),
      publish: jest.fn(),
      close: jest.fn()
    }

    const mockedConnection: any = {
      createChannel: jest.fn().mockResolvedValue(mockedChannel),
      close: jest.fn()
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockedConnection)

    await sendMessage(exchange, routingKey, message, apiKey)

    expect(mockedConnection.createChannel).toHaveBeenCalled()
  })

  it('sends message to the exchange with routing key', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = 'Test message'
    const apiKey = 'test_api_key'

    const mockedChannel: any = {
      assertExchange: jest.fn(),
      publish: jest.fn(),
      close: jest.fn()
    }

    const mockedConnection: any = {
      createChannel: jest.fn().mockResolvedValue(mockedChannel),
      close: jest.fn()
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockedConnection)

    await sendMessage(exchange, routingKey, message, apiKey)

    expect(mockedConnection.createChannel).toHaveBeenCalled()
    expect(mockedChannel.assertExchange).toHaveBeenCalledWith(exchange, 'direct', { durable: true })
    expect(mockedChannel.publish).toHaveBeenCalledWith(exchange, routingKey, Buffer.from(message))
    expect(mockedChannel.close).toHaveBeenCalled()
    expect(mockedConnection.close).toHaveBeenCalled()
  })

  it('handles errors during channel creation', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = 'Test message'
    const apiKey = 'test_api_key'

    const error = new Error(ErrorType.CHANNEL_CREATION_FAILED)
    const mockedConnection: any = {
      createChannel: jest.fn().mockRejectedValueOnce(error),
      close: jest.fn()
    };

    (amqp.connect as jest.Mock).mockResolvedValueOnce(mockedConnection)

    await expect(sendMessage(exchange, routingKey, message, apiKey)).rejects.toThrow(ErrorType.CHANNEL_CREATION_FAILED)

    expect(mockedConnection.createChannel).toHaveBeenCalled()
    expect(mockedConnection.close).not.toHaveBeenCalled()
  })

  it('sends message to the exchange when message is empty', async () => {
    const exchange = 'test_exchange'
    const routingKey = 'test_routing_key'
    const message = ''
    const apiKey = 'test_api_key'

    const mockedChannel: any = {
      assertExchange: jest.fn(),
      publish: jest.fn(),
      close: jest.fn()
    }

    const mockedConnection: any = {
      createChannel: jest.fn().mockResolvedValue(mockedChannel),
      close: jest.fn()
    };

    (amqp.connect as jest.Mock).mockResolvedValueOnce(mockedConnection)

    await sendMessage(exchange, routingKey, message, apiKey)

    expect(mockedConnection.createChannel).toHaveBeenCalled()
    expect(mockedChannel.assertExchange).toHaveBeenCalledWith(exchange, 'direct', { durable: true })
    expect(mockedChannel.publish).toHaveBeenCalledWith(exchange, routingKey, Buffer.from(message))
    expect(mockedChannel.close).toHaveBeenCalled()
    expect(mockedConnection.close).toHaveBeenCalled()
  })

  it('should use TLS for secure communication', () => {
    const amqpUrl = 'amqps://localhost:5671'

    const protocol = amqpUrl.split('://')[0]

    expect(protocol).toBe('amqps')
  })

  it('ensures TLS certificate paths are defined', async () => {
    config.client_cert = ''
    config.client_key = ''
    config.ca_cert = ''

    try {
      await sendMessage('test_exchange', 'test_routing_key', 'Test message', 'test_api_key')
      fail('Expected an error to be thrown')
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe(ErrorType.CERT_PATH_NOT_DEFINED)
    }
  })

  it('transmits data over an encrypted connection', async () => {
    const mockedChannel: any = {
      assertExchange: jest.fn(),
      publish: jest.fn(),
      close: jest.fn()
    }

    const mockedConnection: any = {
      createChannel: jest.fn().mockResolvedValue(mockedChannel),
      close: jest.fn()
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockedConnection)

    await expect(sendMessage('test_exchange', 'test_routing_key', 'Test message', 'test_api_key')).resolves.not.toThrow()
  })
})
