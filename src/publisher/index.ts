import * as amqp from 'amqplib'
import dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export async function sendMessage (
  exchange: string,
  routingKey: string,
  message: string,
  apiKey: string
): Promise<void> {
  let connection: amqp.Connection | null = null
  let channel: amqp.Channel | null = null

  try {
    const rabbitMQUrl = process.env.RABBIT_MQ_URL ?? '' // Default URL
    connection = await amqp.connect(rabbitMQUrl)
    channel = await connection.createChannel()

    await channel.assertExchange(exchange, 'direct', { durable: true })
    channel.publish(exchange, routingKey, Buffer.from(message))
  } finally {
    if (channel != null) {
      await channel.close()
    }
    if (connection != null) {
      await connection.close()
    }
  }
}
