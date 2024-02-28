import * as amqp from 'amqplib'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
export async function sendMessage (exchange: string, routingKey: string, message: string, apiKey: string): Promise<void> {
  let connection: amqp.Connection | null = null
  let channel: amqp.Channel | null = null

  try {
    const rabbitMQUrl = process.env.RABBIT_MQ_URL ?? ''
    if (rabbitMQUrl === '') {
      throw new Error('RabbitMQ URL is not provided in the environment variables.')
    }

    connection = await amqp.connect(rabbitMQUrl)
    channel = await connection.createChannel()

    await channel.assertExchange(exchange, 'direct', { durable: true })
    channel.publish(exchange, routingKey, Buffer.from(message))

    console.log(`Sent message '${message}' with API key '${apiKey}' to exchange '${exchange}' with routing key '${routingKey}'`)
  } finally {
    if (channel != null) {
      await channel.close()
    }
    if (connection != null) {
      await connection.close()
    }
  }
}
