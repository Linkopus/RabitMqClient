import * as amqp from 'amqplib'
import dotenv from 'dotenv'
import * as path from 'path'
import fs from 'fs'
import ErrorType from '../utils/errorMessages'
import config from '../config/config'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export async function sendMessage (
  exchange: string,
  routingKey: string,
  message: string,
  apiKey: string
): Promise<void> {
  try {
    const rabbitMQUrl = config.rabbitmqurl
    const clientCertPath = config.client_cert
    const clientKeyPath = config.client_key
    const caCertPath = config.ca_cert
    const passphrase = config.passphrase

    if (!clientCertPath || !clientKeyPath || !caCertPath) {
      throw new Error(ErrorType.CERT_PATH_NOT_DEFINED)
    }
    const clientCert = fs.readFileSync(clientCertPath)
    const clientKey = fs.readFileSync(clientKeyPath)
    const caCert = fs.readFileSync(caCertPath)

    const connection: amqp.Connection = await amqp.connect(rabbitMQUrl, {
      cert: clientCert,
      key: clientKey,
      passphrase,
      ca: [caCert]
    })

    const channel: amqp.Channel = await connection.createChannel()

    await channel.assertExchange(exchange, 'direct', { durable: true })
    channel.publish(exchange, routingKey, Buffer.from(message))

    await channel.close()
    await connection.close()
  } catch (error) {
    console.error('Error occurred:', error)
  }
}
