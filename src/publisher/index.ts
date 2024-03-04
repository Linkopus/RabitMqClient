import * as amqp from 'amqplib'
import dotenv from 'dotenv'
import * as path from 'path'
import fs from 'fs'

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
    const rabbitMQUrl = process.env.RABBIT_MQ_URL ?? ''
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

    connection = await amqp.connect(rabbitMQUrl, {
      cert: clientCert,
      key: clientKey,
      passphrase: 'linkopus',
      ca: [caCert]
    })

    channel = await connection.createChannel() // Non-null assertion operator here

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
