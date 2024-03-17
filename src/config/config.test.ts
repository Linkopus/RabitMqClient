import dotenv from 'dotenv'
import findConfig from 'find-config'

const envPath = findConfig('.env')
dotenv.config({ path: envPath ?? undefined })

interface Config {

  client_cert_test: string
  client_key_test: string
  ca_cert_test: string
  passphrase_test: string

}

const config: Config = {
  client_cert_test: '<rootDir>/src/ssl_cert/ca_certificate.pem',
  client_key_test: '<rootDir>/src/ssl_cert/client_private_key.pem',
  ca_cert_test: '<rootDir>/src/ssl_cert/ca_certificate.pem',
  passphrase_test: 'test_passphrase'
}

export default config
