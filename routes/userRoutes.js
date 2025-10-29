import express from 'express';
import {
  userRegister,
  getUsers,
  loginUser,
  createProfile,
  userProfile,
  partnerPreferences,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  getUserProfile,
  getMatches,
  generateOtp,
  receivedOtp,
} from '../controllers/userController.js';

import authMiddleware from '../middlewares/Auth.js';
import { validateUserRegistration } from '../middlewares/auth_register.js';
import multer from '../utils/multer.js';

const route = express.Router();

// Auth & User Management
route.post('/register', userRegister);
route.get('/getUser', getUsers);
route.post('/login', loginUser);
route.post('/generateOtp', generateOtp);
route.post('/receivedOtp', receivedOtp);

// Profile Management
// route.post('/profile', authMiddleware, profileSetup);
route.post("/profile-setup", authMiddleware, multer.single("image"), createProfile);
route.post('/user-profile', authMiddleware, userProfile);
route.get('/profile', authMiddleware, getUserProfile);

// Partner Preferences
route.post('/user-preference', authMiddleware, partnerPreferences);
route.get('/preference-matches', authMiddleware, getMatches);

// Follow System
route.post('/follow/:username', authMiddleware, sendFollowRequest);
route.post('/follow/accept/:username', authMiddleware, acceptFollowRequest);
route.post('/follow/reject/:username', authMiddleware, rejectFollowRequest);

export default route;
