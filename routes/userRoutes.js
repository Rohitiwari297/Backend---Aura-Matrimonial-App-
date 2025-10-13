import express from 'express';
import { userRegister, getUsers, loginUser, loginWithOtp, profileSetup, userProfile, partnerPreferences } from '../controllers/userController.js';
import authMiddleware from '../middlewares/Auth.js';

// Create router instance
const route = express.Router();

// Define routes
route.post('/register', userRegister);
route.get('/getUser', getUsers);
route.post('/login', loginUser)
route.post('/otplogin', loginWithOtp)
route.post('/profile', profileSetup);
route.post('/user-profile',authMiddleware, userProfile)
route.post('/user-preference',authMiddleware, partnerPreferences)


// Export routes
export default route;
