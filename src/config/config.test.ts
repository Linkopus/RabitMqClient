import dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

interface Config {
  rabbitmqurl_test: string
  client_cert_test: string
  client_key_test: string
  ca_cert_test: string
  passphrase_test: string

}

const config: Config = {
  rabbitmqurl_test: 'amqps://localhost:5671',
  client_cert_test: '<rootDir>/src/ssl_cert/ca_certificate.pem',
  client_key_test: '<rootDir>/src/ssl_cert/client_private_key.pem',
  ca_cert_test: '<rootDir>/src/ssl_cert/ca_certificate.pem',
  passphrase_test: 'test_passphrase'
}

export default config
