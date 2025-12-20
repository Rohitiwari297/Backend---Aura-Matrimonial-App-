import express from 'express'
import { loginWithMailOtp, sendMail } from '../controllers/sendMailController.js';
import authMiddleware from '../middlewares/Auth.js';


const mail = express()

mail.post('/send/', sendMail)
mail.post('/send/otp', loginWithMailOtp)



//export
export default mail;