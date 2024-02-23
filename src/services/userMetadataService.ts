import UserMetadata from '../models/userMetadata'
import { type Document } from 'mongoose'

interface User {
  name: string
  email: string
  password: string
}

class UserMetadataService {
  async createUser (userData: User): Promise<Document> {
    const user = new UserMetadata(userData)
    await user.save()
    return user
  }

  async getAllUsers (): Promise<Document[]> {
    return await UserMetadata.find()
  }

  async getUserByEmail (email: string): Promise<Document | null> {
    return await UserMetadata.findOne({ email })
  }

  async updateUser (email: string, updateData: Partial<User>): Promise<Document | null> {
    return await UserMetadata.findOneAndUpdate({ email }, updateData, { new: true })
  }

  async searchUsersByName (name: string): Promise<Document[]> {
    return await UserMetadata.find({ name: { $regex: name, $options: 'i' } })
  }

  async deleteUserByEmail (email: string): Promise<{ deletedCount?: number }> {
    const result = await UserMetadata.deleteOne({ email })
    return result
  }
}

export default new UserMetadataService()
