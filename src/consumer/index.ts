import * as amqp from 'amqplib'
import dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export async function consumeMessages (
  exchange: string,
  routingKey: string,
  apiKey: string // API key for each instance of the consumer microservice
): Promise<void> {
  let connection: amqp.Connection | null = null
  let channel: amqp.Channel | null = null

  try {
    const rabbitMQUrl = process.env.RABBIT_MQ_URL ?? ''
    connection = await amqp.connect(rabbitMQUrl)
    channel = await connection.createChannel()

    const queueName = `${routingKey}-${apiKey}` // Incorporate API key into the queue name

    await channel.assertExchange(exchange, 'direct', { durable: true })

    
    const assertQueue = await channel.assertQueue(queueName, { exclusive: false, autoDelete: true }) // Enable auto-delete for the queue
    await channel.bindQueue(assertQueue.queue, exchange, routingKey)

    console.log(`Waiting for messages in queue '${queueName}' from exchange '${exchange}' with routing key '${routingKey}'`)

    await channel.consume(queueName, (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString()
        const messageRoutingKey = msg.fields.routingKey

        if (messageRoutingKey === routingKey) {
          console.log(`Received message '${messageContent}' with routing key '${messageRoutingKey}'`)
        } else {
          console.log(`Ignoring message with invalid routing key '${messageRoutingKey}'`)
        }

        // Acknowledge the message
        if (channel !== null) {
          channel.ack(msg)
        }
      }
    }, { exclusive: false })
  } catch (error) {
    console.error('Error consuming messages:', error)
  }
}

