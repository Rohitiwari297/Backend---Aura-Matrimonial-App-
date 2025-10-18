import express from 'express';
import { userRegister, getUsers, loginUser, loginWithOtp, profileSetup, userProfile, partnerPreferences, sendFollowRequest, acceptFollowRequest, rejectFollowRequest, getUserProfile } from '../controllers/userController.js';
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
route.get('/profile', authMiddleware, getUserProfile)
route.post('/user-preference',authMiddleware, partnerPreferences)
route.post('/follow/:username', authMiddleware, sendFollowRequest);
route.post('/follow/accept/:username', authMiddleware, acceptFollowRequest);
route.post('/follow/reject/:username', authMiddleware, rejectFollowRequest);






// Export routes
export default route;
