import * as amqp from 'amqplib'

const RABBITMQ_URL = 'amqp://localhost'
const QUEUE_NAME = 'logs'
const DELAY_MS = 500

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export async function publishToQueue (): Promise<void> {
  const message = 'hello'

  try {
    const connection = await amqp.connect(RABBITMQ_URL)
    const channel = await connection.createChannel()

    await channel.assertQueue(QUEUE_NAME, {
      durable: false
    })

    channel.sendToQueue(QUEUE_NAME, Buffer.from(message))
    console.log(' [x] Sent %s', message)

    await delay(DELAY_MS) // Wait for a delay before closing the connection
    await connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Failed to publish message to the queue:', error)
    throw error // Rethrow the error to ensure it's not silently ignored
  }
}

async function delay (ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

void (async () => {
  try {
    await publishToQueue()
  } catch (error) {
    // Handle any uncaught errors here
    console.error('An error occurred:', error)
    process.exit(1) // Exit the process with a non-zero status code to indicate failure
  }
})()
