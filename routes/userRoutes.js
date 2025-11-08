import express from 'express';
import {
  userRegister,
  getUsers,
  loginUser,
  createProfile,
  partnerPreferences,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  getUserProfile,
  getMatches,
  generateOtp,
  receivedOtp,
  updateUser,
  unfollowRequest,
  updateProfile,
  updatePartnerPreferences,
} from '../controllers/userController.js';

import authMiddleware from '../middlewares/Auth.js';
import multer from '../utils/multer.js';

const route = express.Router();

// Auth & User Management
route.post('/register', userRegister);
route.get('/getUser', getUsers);
route.post('/login', loginUser);
route.put('/updateUser', authMiddleware, updateUser);
route.post('/generateOtp', generateOtp);
route.post('/receivedOtp', receivedOtp);

// Profile Management
route.post("/profile-setup", authMiddleware, multer.array("image", 4), createProfile);
route.get('/profile', authMiddleware, getUserProfile);
route.put('/profile/update/:id', authMiddleware, multer.array("image", 1), updateProfile)

// Partner Preferences
route.post('/user-preference', authMiddleware, partnerPreferences);
route.get('/preference-matches', authMiddleware, getMatches);
route.put('/user-preference', authMiddleware, updatePartnerPreferences)

// Follow System
route.post('/follow/:id', authMiddleware, sendFollowRequest);
route.post('/unfollow/:id', authMiddleware, unfollowRequest);
route.post('/follow/accept/:id', authMiddleware, acceptFollowRequest);
route.post('/follow/reject/:id', authMiddleware, rejectFollowRequest);


export default route;
