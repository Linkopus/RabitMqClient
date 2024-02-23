import mongoose from 'mongoose'
import config from '../config/config'

const connectDB = async (): Promise<void> => {
  console.log('connecting to MongoDB ...')
  try {
    await mongoose.connect(config.mongodbUri)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export default connectDB
