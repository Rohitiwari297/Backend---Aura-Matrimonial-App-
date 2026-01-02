import express from 'express'
import { sendMessage, getMessage, getChatHistoryUsers } from '../controllers/messageController.js'
import {authMiddleware} from '../middlewares/Auth.js'
import { validateSubscriptions } from '../middlewares/checkSubs.js';




// create instance
const route = express.Router()

//routes
route.post('/send/:id', authMiddleware, validateSubscriptions,sendMessage )
route.get('/get/:id', authMiddleware, getMessage)
route.get('/chat', authMiddleware ,getChatHistoryUsers)

//export
export default route