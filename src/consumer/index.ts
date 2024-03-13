import * as amqp from 'amqplib'
import dotenv from 'dotenv'
import * as path from 'path'
import fs from 'fs'
import ErrorType from '../utils/errorMessages'
import config from '../config/config'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const sharedConnection: { connection: amqp.Connection | null } = { connection: null }
const sharedChannel: { channel: amqp.Channel | null } = { channel: null }

async function createChannel (rabbitMQUrl: string): Promise<amqp.Channel> {
  try {
    if (!sharedConnection.connection || !sharedChannel.channel) {
      const passphrase = config.passphrase

      if (!config.client_cert || !config.client_key || !config.ca_cert) {
        throw new Error(ErrorType.CERT_PATH_NOT_DEFINED)
      }

      const clientCert = fs.readFileSync(config.client_cert)
      const clientKey = fs.readFileSync(config.client_key)
      const caCert = fs.readFileSync(config.ca_cert)

      const connection = await amqp.connect(rabbitMQUrl, {
        cert: clientCert,
        key: clientKey,
        passphrase,
        ca: [caCert]
      })
      const channel = await connection.createChannel()
      connection.on('error', (err) => {
        console.error('Shared connection error', err)
      })
      connection.on('close', () => {
        console.log('Shared connection closed')
      })

      sharedConnection.connection = connection
      sharedChannel.channel = channel
    }

    return sharedChannel.channel
  } catch (error) {
    console.error('Error creating channel:', error)
    throw error
  }
}

export async function consumeMessages (
  exchange: string,
  routingKey: string,
  apiKey: string,
  callback: (content: string, key: string) => void
): Promise<void> {
  try {
    const rabbitMQUrl = config.rabbitmqurl
    const channel = await createChannel(rabbitMQUrl)

    const queueName = apiKey
    await channel.assertExchange(exchange, 'direct', { durable: true })
    const assertQueue = await channel.assertQueue(queueName, { exclusive: false, autoDelete: true })
    await channel.bindQueue(assertQueue.queue, exchange, routingKey)

    console.log(`Waiting for messages in '${queueName}' from '${exchange}' with '${routingKey}'`)

    await new Promise<void>((resolve, reject) => {
      channel.consume(queueName, (msg) => {
        if (msg) {
          const content = msg.content.toString()
          const key = msg.fields.routingKey

          console.log(`Received:'${content}' with key '${key}'`)
          callback(content, key)
          channel.ack(msg)
        }
      }, { noAck: false })
        .then(() => { resolve() })
        .catch((error) => { reject(error) })
    })
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
