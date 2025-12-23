import express from 'express'
import { logInAdmin } from '../controllers/adminController.js';


const admin = express.Router()

admin.post('/signin', logInAdmin)


export default admin;