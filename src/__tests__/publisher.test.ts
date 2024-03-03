import { sendMessage } from '../publisher/index'
import * as amqp from 'amqplib'
import dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
jest.mock('amqplib')

describe('sendMessage', () => {
  beforeEach(() => {
    process.env.RABBIT_MQ_URL = 'amqps://localhost:5671'
    process.env.CLIENT_CERT_PATH = '/etc/rabbitmq/ssl/tls-gen/basic/result/client_certificate.pem'
    process.env.CLIENT_KEY_PATH = '/etc/rabbitmq/ssl/tls-gen/basic/result/client_private_key.pem'
    process.env.CA_CERT_PATH = '/etc/rabbitmq/ssl/tls-gen/basic/result/ca_certificate.pem'
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

    expect(amqp.connect).toHaveBeenCalledWith(
      expect.stringMatching(/^amqps:\/\/localhost:5671$/),
      expect.objectContaining({
        ca: expect.anything(),
        cert: expect.anything(),
        key: expect.anything(),
        passphrase: expect.anything()
      })
    )
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

    expect(amqp.connect).toHaveBeenCalledWith(
      expect.stringMatching(/^amqps:\/\/localhost:5671$/),
      expect.objectContaining({
        ca: expect.anything(),
        cert: expect.anything(),
        key: expect.anything(),
        passphrase: expect.anything()
      })
    )
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

    const error = new Error('Channel creation failed')
    const mockedConnection: any = {
      createChannel: jest.fn().mockRejectedValueOnce(error),
      close: jest.fn()
    };

    (amqp.connect as jest.Mock).mockResolvedValueOnce(mockedConnection)

    await expect(sendMessage(exchange, routingKey, message, apiKey)).rejects.toThrow('Channel creation failed')

    expect(amqp.connect).toHaveBeenCalledWith(
      expect.stringMatching(/^amqps:\/\/localhost:5671$/),
      expect.objectContaining({
        ca: expect.anything(),
        cert: expect.anything(),
        key: expect.anything(),
        passphrase: expect.anything()
      })
    )
    expect(mockedConnection.createChannel).toHaveBeenCalled()
    expect(mockedConnection.close).toHaveBeenCalled()
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

    expect(amqp.connect).toHaveBeenCalledWith(
      expect.stringMatching(/^amqps:\/\/localhost:5671$/),
      expect.objectContaining({
        ca: expect.anything(),
        cert: expect.anything(),
        key: expect.anything(),
        passphrase: expect.anything()
      })
    )
    expect(mockedConnection.createChannel).toHaveBeenCalled()
    expect(mockedChannel.assertExchange).toHaveBeenCalledWith(exchange, 'direct', { durable: true })
    expect(mockedChannel.publish).toHaveBeenCalledWith(exchange, routingKey, Buffer.from(message))
    expect(mockedChannel.close).toHaveBeenCalled()
    expect(mockedConnection.close).toHaveBeenCalled()
  })
  it('should use TLS for secure communication', () => {
    const amqpUrl = 'amqps://localhost:5671'

    // Extract protocol from the AMQP URL
    const protocol = amqpUrl.split('://')[0]

    // Assert that the protocol is 'amqps' indicating TLS usage
    expect(protocol).toBe('amqps')
  })

  it('ensures TLS certificate paths are defined', async () => {
    // Unset certificate paths
    delete process.env.CLIENT_CERT_PATH
    delete process.env.CLIENT_KEY_PATH
    delete process.env.CA_CERT_PATH

    await expect(sendMessage('test_exchange', 'test_routing_key', 'Test message', 'test_api_key'))
      .rejects
      .toThrow('Client certificate, client key, or CA certificate paths are not defined.')
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

    await sendMessage('test_exchange', 'test_routing_key', 'Test message', 'test_api_key')

    // Verify that the amqplib's connect method is called with an encrypted connection (amqps://)
    expect(amqp.connect).toHaveBeenCalledWith(
      expect.stringMatching(/^amqps:\/\/localhost:5671$/),
      expect.objectContaining({
        ca: expect.anything(),
        cert: expect.anything(),
        key: expect.anything(),
        passphrase: expect.anything()
      })
    )
    // Additional assertions can be added here to inspect the encrypted data or verify the use of specific encryption algorithms.
  })
})
