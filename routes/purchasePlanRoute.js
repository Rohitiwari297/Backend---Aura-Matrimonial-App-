import express from 'express'
import {authMiddleware, isAdmin} from '../middlewares/Auth.js'
import { createPurchasePlan, getActiveUsers, getCurrentActivePlan, getExpPlan, getSubscriptionDetails } from '../controllers/purchasePlanController.js'




// instance to route
const route = express.Router()

//defining all routes
route.post('/buy/:id', authMiddleware, createPurchasePlan );
route.get('/getDetails', authMiddleware, getSubscriptionDetails);
route.get('/get/active-plan', authMiddleware, getCurrentActivePlan)
route.get('/getExpiredUsers', authMiddleware, isAdmin, getExpPlan)
route.get('/getActiveUsers', authMiddleware, isAdmin, getActiveUsers)

// export route
export default route;