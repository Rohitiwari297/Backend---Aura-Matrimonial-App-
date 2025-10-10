import express from 'express';
import { userRegister, getUsers } from '../controllers/userController.js';

// Create router instance
const route = express.Router();

// Define routes
route.post('/register', userRegister);
route.get('/getUser', getUsers);

// Export routes
export default route;
