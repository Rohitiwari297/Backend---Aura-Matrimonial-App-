import express from 'express'
import {authMiddleware, isAdmin} from '../middlewares/Auth.js'
import { createPurchasePlan, getActiveUsers, getExpPlan, getSubscriptionDetails } from '../controllers/purchasePlanController.js'




// instance to route
const route = express.Router()

//defining all routes
route.post('/buy/:id', authMiddleware, createPurchasePlan );
route.get('/getDetails', authMiddleware, getSubscriptionDetails);
route.get('/getExpiredUsers', authMiddleware, isAdmin, getExpPlan)
route.get('/getActiveUsers', authMiddleware, isAdmin, getActiveUsers)

// export route
export default route;