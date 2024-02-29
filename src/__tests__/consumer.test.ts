import { consumeMessages } from '../consumer';
import { sendMessage } from '../publisher';
import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
jest.mock('amqplib');

describe('Messaging Scenario', () => {
  beforeAll(() => {
    process.env.RABBIT_MQ_URL = 'amqp://localhost';
  });

  it('should send and consume a message', async () => {
    const exchange = 'test_exchange';
    const routingKey = 'test_routing_key';
    const message = 'Test message';
    const apiKey = 'test_api_key';
    const rabbitMQUrl = process.env.RABBIT_MQ_URL;

    const mockedChannel: any = {
      assertExchange: jest.fn(),
      assertQueue: jest.fn(),
      bindQueue: jest.fn(),
      consume: jest.fn(),
      publish: jest.fn(),
      ack: jest.fn(),
      close: jest.fn(),
    };

    const mockedConnection: any = {
      createChannel: jest.fn().mockResolvedValue(mockedChannel),
      close: jest.fn(),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockedConnection);

    // Set up a consumer to listen for messages
    await consumeMessages(exchange, routingKey, apiKey);

    // Wait for the consumer to establish connection and set up the queue
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send a message from the publisher
    await sendMessage(exchange, routingKey, message, apiKey);

    // Allow some time for the message to be consumed
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(amqp.connect).toHaveBeenCalledWith(rabbitMQUrl);
    expect(mockedConnection.createChannel).toHaveBeenCalled();
  }, 5000); // Increase timeout if needed
});
