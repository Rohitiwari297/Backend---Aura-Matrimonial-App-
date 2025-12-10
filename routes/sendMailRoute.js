import express from 'express'
import { sendMail } from '../controllers/sendMailController.js';
import authMiddleware from '../middlewares/Auth.js';


const mail = express()

mail.post('/send/', sendMail)



//export
export default mail;