import express from 'express';
import { userRegister, getUsers, loginUser, loginWithOtp } from '../controllers/userController.js';

// Create router instance
const route = express.Router();

// Define routes
route.post('/register', userRegister);
route.get('/getUser', getUsers);
route.post('/login', loginUser)
route.post('/otplogin', loginWithOtp)

// Export routes
export default route;
