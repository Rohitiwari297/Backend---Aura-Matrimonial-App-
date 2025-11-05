import express from 'express'
import {authMiddleware} from '../middlewares/Auth.js'
import { createPurchasePlan } from '../controllers/purchasePlanController.js'




// instance to route
const route = express.Router()

//defining all routes
route.post('/buy/:id', authMiddleware, createPurchasePlan );

// export route
export default route;