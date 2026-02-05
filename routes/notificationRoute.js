import express from 'express'
import { deleteNotification, getNotificationData, saveAccessToken, sendNotificaion } from '../controllers/notificationController.js';
import {authMiddleware} from '../middlewares/Auth.js'


const notify = express.Router();

notify.post('/send/:id', sendNotificaion);
notify.get('/get', getNotificationData);
notify.delete('/delete/:id', authMiddleware, deleteNotification);
notify.post('/token', authMiddleware, saveAccessToken)

// EXPORT THE NOTIFY ROUTER
export default notify;