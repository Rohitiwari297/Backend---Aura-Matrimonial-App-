import express from 'express'
import { sendMessage, getMessage } from '../controllers/messageController.js'
import {authMiddleware} from '../middlewares/Auth.js'


// create instance
const route = express.Router()

//routes
route.post('/send/:id', authMiddleware, sendMessage )
route.get('/get/:id', authMiddleware, getMessage)

//export
export default route