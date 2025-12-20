import express from 'express'
<<<<<<< HEAD
import { deleteNotification, getNotificationData, sendNotificaion } from '../controllers/notificationController.js';
import {authMiddleware} from '../middlewares/Auth.js'
=======
import { sendNotificaion } from '../controllers/notificationController.js';
>>>>>>> 90aecdb9db7c7d089dfb2b2da8b259a87fc6c131


const notify = express.Router();

<<<<<<< HEAD
notify.post('/send/:id', sendNotificaion);
notify.get('/get', getNotificationData);
notify.delete('/delete/:id', authMiddleware, deleteNotification);
=======
notify.post('/send/:id', sendNotificaion)
>>>>>>> 90aecdb9db7c7d089dfb2b2da8b259a87fc6c131

// EXPORT THE NOTIFY ROUTER
export default notify;