import * as amqp from 'amqplib/callback_api'

const RABBITMQ_URL = 'amqp://localhost'
const QUEUE_NAME = 'logs'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export function publishToQueue (): void {
  const message = 'hello'

  amqp.connect(RABBITMQ_URL, function (error0: Error | null, connection: amqp.Connection | undefined) {
    if (error0 !== null) {
      throw new Error(`Failed to connect to RabbitMQ: ${error0.message}`)
    }
    connection?.createChannel(function (error1: Error | null, channel: amqp.Channel | undefined) {
      if (error1 !== null) {
        throw new Error(`Failed to create channel: ${error1.message}`)
      }
      if (channel === undefined) {
        throw new Error('Failed to create channel: Channel creation error')
      }

      channel.assertQueue(QUEUE_NAME, {
        durable: false
      })

      channel.sendToQueue(QUEUE_NAME, Buffer.from(message))
      console.log(' [x] Sent %s', message)

      setTimeout(function () {
        connection?.close()
        process.exit(0)
      }, 500)
    })
  })
}

publishToQueue()
