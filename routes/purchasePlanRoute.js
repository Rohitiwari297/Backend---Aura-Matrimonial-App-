import express from 'express'
import {authMiddleware} from '../middlewares/Auth.js'
import { createPurchasePlan, getSubscriptionDetails } from '../controllers/purchasePlanController.js'




// instance to route
const route = express.Router()

//defining all routes
route.post('/buy/:id', authMiddleware, createPurchasePlan );
route.get('/getDetails', authMiddleware, getSubscriptionDetails);

// export route
export default route;