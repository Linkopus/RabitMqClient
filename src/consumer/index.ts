import * as amqp from 'amqplib'
import dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function createChannel (rabbitMQUrl: string): Promise<amqp.Channel> {
  try {
    const connection = await amqp.connect(rabbitMQUrl)
    const channel = await connection.createChannel()

    connection.on('error', (err) => { console.error('Connection error', err) })
    connection.on('close', () => { console.log('Connection closed') })

    return channel
  } catch (error) {
    console.error('Error creating channel:', error)
    throw error
  }
}

export async function consumeMessages (
  exchange: string,
  routingKey: string,
  apiKey: string
): Promise<void> {
  try {
    const rabbitMQUrl = process.env.RABBIT_MQ_URL ?? ''
    const channel = await createChannel(rabbitMQUrl)

    const queueName = `${routingKey}-${apiKey}`
    await channel.assertExchange(exchange, 'direct', { durable: true })
    const assertQueue = await channel.assertQueue(queueName, { exclusive: false, autoDelete: true })
    await channel.bindQueue(assertQueue.queue, exchange, routingKey)

    console.log(`Waiting for messages in '${queueName}' from '${exchange}' with '${routingKey}'`)

    // Await the Promise returned by channel.consume
    await new Promise<void>((resolve, reject) => {
      channel.consume(queueName, (msg) => {
        if (msg !== null) {
          const content = msg.content.toString()
          const key = msg.fields.routingKey

          if (key === routingKey) {
            console.log(`Received: '${content}' with key '${key}'`)
            channel.ack(msg)
          } else {
            console.log(`Ignored: invalid key '${key}'`)
          }
        }
      }, { noAck: false }).then(() => {
        resolve() // Resolve the Promise when consumption is complete
      }).catch((error) => {
        reject(error) // Reject the Promise if there's an error
      })
    })
  } catch (error) {
    console.error('Error:', error)
  }
}
