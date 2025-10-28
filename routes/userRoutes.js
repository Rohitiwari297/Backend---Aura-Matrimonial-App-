import express from 'express';
import {
  userRegister,
  getUsers,
  loginUser,
  loginWithOtp,
  profileSetup,
  userProfile,
  partnerPreferences,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  getUserProfile,
  getMatches,
} from '../controllers/userController.js';

import authMiddleware from '../middlewares/Auth.js';
import { validateUserRegistration } from '../middlewares/auth_register.js';

const route = express.Router();

// Auth & User Management
route.post('/register', userRegister);
route.get('/getUser', getUsers);
route.post('/login', loginUser);
route.post('/otplogin', loginWithOtp);

// Profile Management
route.post('/profile', authMiddleware, profileSetup);
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
