import dotenv from 'dotenv'
import findConfig from 'find-config'

const envPath = findConfig('.env')
dotenv.config({ path: envPath ?? undefined })

interface Config {
  rabbitmqurl: string
  client_cert: string
  client_key: string
  ca_cert: string
  passphrase: string

}

const config: Config = {
  rabbitmqurl: process.env.RABBIT_MQ_URL ?? 'amqps://localhost:5671',
  client_cert: process.env.CLIENT_CERT_PATH ?? '',
  client_key: process.env.CLIENT_KEY_PATH ?? '',
  ca_cert: process.env.CA_CERT_PATH ?? '',
  passphrase: process.env.PASSPHRASE ?? ''
}

export default config
