import express from 'express'
import { sendNotificaion } from '../controllers/notificationController.js';


const notify = express.Router();

notify.post('/send/:id', sendNotificaion)

// EXPORT THE NOTIFY ROUTER
export default notify;