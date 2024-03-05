import * as amqp from 'amqplib'
import fs from 'fs'
import ErrorType from '../utils/errorMessages'
import config from '../config/config'

export async function sendMessage (
  exchange: string,
  routingKey: string,
  message: string,
  apiKey: string
): Promise<void> {
  try {
    const passphrase = config.passphrase
    if (!config.client_cert || !config.client_key || !config.ca_cert) {
      throw new Error(ErrorType.CERT_PATH_NOT_DEFINED)
    }
    const clientCert = fs.readFileSync(config.client_cert)
    const clientKey = fs.readFileSync(config.client_key)
    const caCert = fs.readFileSync(config.ca_cert)

    const connection: amqp.Connection = await amqp.connect(config.rabbitmqurl, {
      cert: clientCert,
      key: clientKey,
      config,
      ca: [caCert],
      passphrase
    })

    const channel: amqp.Channel = await connection.createChannel()

    await channel.assertExchange(exchange, 'direct', { durable: true })
    channel.publish(exchange, routingKey, Buffer.from(message))

    await channel.close()
    await connection.close()
  } catch (error: any) {
    console.error(error.message)
    throw error
  }
}
