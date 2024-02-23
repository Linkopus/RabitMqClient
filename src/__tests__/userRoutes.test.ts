import request from 'supertest'
import express, { type Express } from 'express'
import bodyParser from 'body-parser'
import userRoutes from '../routes/userRoutes'
import userMetadataService from '../services/userMetadataService' // Adjust the import path as necessary

// Mocking the userMetadataService
jest.mock('../services/userMetadataService', () => ({
  getAllUsers: jest.fn(),
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUser: jest.fn(),
  searchUsersByName: jest.fn(),
  deleteUserByEmail: jest.fn()
}))

const app: Express = express()
app.use(bodyParser.json())
app.use(userRoutes)

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('GET /users should fetch all users', async () => {
    (userMetadataService.getAllUsers as jest.Mock).mockResolvedValue([{ name: 'John Doe', email: 'john@example.com', password: 'password123' }])
    const response = await request(app).get('/users')
    expect(response.status).toBe(200)
    expect(response.body).toEqual([{ name: 'John Doe', email: 'john@example.com', password: 'password123' }])
  })

  it('GET /users/:email should handle user not found', async () => {
    (userMetadataService.getUserByEmail as jest.Mock).mockResolvedValue(null)
    const response = await request(app).get('/users/nonexistent@example.com')
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ message: 'User not found' })
  })

  it('POST /users should create a new user', async () => {
    const newUser = { name: 'Jane Doe', email: 'jane@example.com', password: 'securePassword' };
    (userMetadataService.createUser as jest.Mock).mockResolvedValue(newUser)
    const response = await request(app).post('/users').send(newUser)
    expect(response.status).toBe(201)
    expect(response.body).toEqual(newUser)
  })

  // Fetch a user by email
  it('GET /users/:email should fetch a user by email', async () => {
    const user = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
    (userMetadataService.getUserByEmail as jest.Mock).mockResolvedValue(user)
    const response = await request(app).get(`/users/${user.email}`)
    expect(response.status).toBe(200)
    expect(response.body).toEqual(user)
  })

  // Update a user
  it('PUT /users/:email should update a user and return the updated user info', async () => {
    const updatedUserInfo = { name: 'John Doe', email: 'john@example.com', password: 'newPassword123' };
    (userMetadataService.updateUser as jest.Mock).mockResolvedValue(updatedUserInfo)
    const response = await request(app)
      .put(`/users/${updatedUserInfo.email}`)
      .send({ password: 'newPassword123' })
    expect(response.status).toBe(200)
    expect(response.body).toEqual(updatedUserInfo)
  })

  it('PUT /users/:email should handle user not found on update', async () => {
    (userMetadataService.updateUser as jest.Mock).mockResolvedValue(null)
    const response = await request(app).put('/users/nonexistent@example.com').send({ name: 'New Name' })
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ message: 'User not found' })
  })

  it('PUT /users/:email should handle unexpected errors during update', async () => {
    (userMetadataService.updateUser as jest.Mock).mockRejectedValue(new Error('Unexpected error'))
    const response = await request(app).put('/users/error@example.com').send({ name: 'Error Name' })
    expect(response.status).toBe(500)
    expect(response.body).toEqual({ message: 'Unexpected error' })
  })

  // Search users by name
  it('GET /users/search/:name should return users matching the search criteria', async () => {
    const users = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123' },
      { name: 'Johnny Doe', email: 'johnny@example.com', password: 'password456' }
    ];
    (userMetadataService.searchUsersByName as jest.Mock).mockResolvedValue(users)
    const response = await request(app).get('/users/search/John')
    expect(response.status).toBe(200)
    expect(response.body).toEqual(users)
  })

  it('GET /users/search/:name should handle no users found matching search criteria', async () => {
    (userMetadataService.searchUsersByName as jest.Mock).mockResolvedValue([])
    const response = await request(app).get('/users/search/Nonexistent')
    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  // Delete a user by email
  it('DELETE /users/:email should delete a user and return a success message', async () => {
    const emailToDelete = 'john@example.com';
    (userMetadataService.deleteUserByEmail as jest.Mock).mockResolvedValue({ deletedCount: 1 })
    const response = await request(app).delete(`/users/${emailToDelete}`)
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'User deleted successfully' })
  })

  it('DELETE /users/:email should handle unexpected errors during deletion', async () => {
    (userMetadataService.deleteUserByEmail as jest.Mock).mockRejectedValue(new Error('Unexpected error'))
    const response = await request(app).delete('/users/error@example.com')
    expect(response.status).toBe(500)
    expect(response.body).toEqual({ message: 'Unexpected error' })
  })
})
