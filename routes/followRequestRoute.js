import express from "express";
import { acceptFollowRequest, cancelSendRequest, getAllReceivedRequest, getAllSendRequest, getAllSortList, getFollowersList, getFollowingList, rejectFollowRequest, sendFollowRequest, sortListUser, unfollowRequest } from "../controllers/followRequestController.js";
import authMiddleware from "../middlewares/Auth.js";

const router = express.Router();

// Follow System
router.post('/follow/:id', authMiddleware, sendFollowRequest); 
router.post('/unfollow/:id', authMiddleware, unfollowRequest);
router.post('/follow/accept/:id', authMiddleware, acceptFollowRequest);
router.post('/follow/reject/:id', authMiddleware, rejectFollowRequest);
router.post('/cancel-request/:id', authMiddleware, cancelSendRequest);
router.get('/get/followers', authMiddleware, getFollowersList);
router.get('/get/followings', authMiddleware, getFollowingList);
router.get('/get/sendRequest', authMiddleware, getAllSendRequest);
router.get('/get/receivedRequest', authMiddleware, getAllReceivedRequest);
router.post('/sort/user/:id', authMiddleware, sortListUser)
router.get('/get/sort/users/', authMiddleware, getAllSortList)


// Export
export default router;