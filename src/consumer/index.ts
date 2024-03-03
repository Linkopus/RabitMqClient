import * as amqp from 'amqplib'
import dotenv from 'dotenv'
import * as path from 'path'
import fs from 'fs'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

let sharedConnection: amqp.Connection | null = null
let sharedChannel: amqp.Channel | null = null

async function createChannel (rabbitMQUrl: string): Promise<amqp.Channel> {
  try {
    if (sharedConnection === null || sharedChannel === null) {
      const clientCertPath = process.env.CLIENT_CERT_PATH
      const clientKeyPath = process.env.CLIENT_KEY_PATH
      const caCertPath = process.env.CA_CERT_PATH

      if (clientCertPath === null || clientCertPath === undefined || clientCertPath === '' ||
      clientKeyPath === null || clientKeyPath === undefined || clientKeyPath === '' ||
      caCertPath === null || caCertPath === undefined || caCertPath === '') {
        throw new Error('Client certificate, client key, or CA certificate paths are not defined.')
      }

      const clientCert = fs.readFileSync(clientCertPath)
      const clientKey = fs.readFileSync(clientKeyPath)
      const caCert = fs.readFileSync(caCertPath)

      sharedConnection = await amqp.connect(rabbitMQUrl, {
        cert: clientCert,
        key: clientKey,
        passphrase: 'linkopus',
        ca: [caCert]
      })
      sharedChannel = await sharedConnection.createChannel()
      sharedConnection.on('error', (err) => {
        console.error('Shared connection error', err)
      })
      sharedConnection.on('close', () => {
        console.log('Shared connection closed')
      })
    }

    return sharedChannel
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
        resolve()
      }).catch((error) => {
        reject(error)
      })
    })
  } catch (error) {
    console.error('Error:', error)
  }
}
