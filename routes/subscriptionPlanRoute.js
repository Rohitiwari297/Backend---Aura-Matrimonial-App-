// Subscription Plan Routes
import express from 'express';
import { createSubscriptionPlan, deleteSubscriptionPlan, editSubscriptionPlan, getAllSubscriptionPlan } from '../controllers/subscriptionPlanController.js';
import {authMiddleware, isAdmin} from '../middlewares/Auth.js';

const router = express.Router();

router.post('/create', authMiddleware, isAdmin, createSubscriptionPlan);
router.get('/all', authMiddleware, getAllSubscriptionPlan);
router.put('/edit/:id', authMiddleware, isAdmin, editSubscriptionPlan);
router.delete('/delete/:id', authMiddleware, isAdmin, deleteSubscriptionPlan);

export default router;
