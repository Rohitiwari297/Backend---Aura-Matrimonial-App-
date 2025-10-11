import express from 'express';
import { userRegister, getUsers, loginUser, loginWithOtp, profileSetup } from '../controllers/userController.js';
import authMiddleware from '../middlewares/Auth.js';

// Create router instance
const route = express.Router();

// Define routes
route.post('/register', userRegister);
route.get('/getUser', getUsers);
route.post('/login', loginUser)
route.post('/otplogin', loginWithOtp)
route.post('/profile', authMiddleware, profileSetup)

// Export routes
export default route;
