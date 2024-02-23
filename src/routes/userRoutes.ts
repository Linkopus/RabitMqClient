import { Router, type Request, type Response } from 'express'
import userMetadataService from '../services/userMetadataService'

interface User {
  name: string
  email: string
  password: string
}

const router = Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userMetadataService.getAllUsers()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
})
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userMetadataService.createUser(req.body as User)
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
})
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/users/:email', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userMetadataService.getUserByEmail(req.params.email)
    if (user !== null) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
})
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.put('/users/:email', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser = await userMetadataService.updateUser(req.params.email, req.body as Partial<User>)
    if (updatedUser !== null) {
      res.status(200).json(updatedUser)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
})
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/users/search/:name', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userMetadataService.searchUsersByName(req.params.name)
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
})
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.delete('/users/:email', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await userMetadataService.deleteUserByEmail(req.params.email)
    if (result.deletedCount !== undefined) {
      res.status(200).json({ message: 'User deleted successfully' })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unexpected error occurred' })
  }
})

export default router
