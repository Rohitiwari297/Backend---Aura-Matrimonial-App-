// Purchase Plan Controller

import SubscriptionDetails from '../models/subscriptionDetailsSchma.js';
import SubscriptionPlan from '../models/subscriptionPlanSchema.js';
import User from '../models/userSchema.js';

// purchase Plan
export const createPurchasePlan = async (req, res) => {
    try {
        const userId = req.user._id;       
        const planId = req.params.id;
        
        // Log the received values
        console.log("userId:", userId);
        console.log("PlanId:", planId);

        // Check if the user Exists
        const user = await User.findById(userId);
        if(!user){
            res.status(404).json({
                success: false,
                message: 'User not exists'
            })
        }

        // check if the plan exists
        const plan = await SubscriptionPlan.findById(planId)
        if( !plan ) {
            res.status(404).json({
                success: false,
                message: 'Kindly select valid plan'
            })
        }

        // create the plan agains user
        const subscriptionDetails  = new SubscriptionDetails({
            user_id: userId,
            subscription_plan_id: planId,
            planName: plan.planName,
            amount: plan.price,
            maxFollowRequests: plan.maxFollowRequests,
            validity_days: plan.validity_days,
            startDate: new Date(),
            expiryDate: new Date(Date.now() + plan.validity_days * 24 * 60 * 60 * 1000) // calculating end date

        })
        await subscriptionDetails.save();
        res.status(201).json({
            success: true,
            message: "Plan purchased successfully",
            subscriptionDetails
        });


        
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            success: false,
            message: "Failed to purchase plan",
            error: error.message
        })
    }
};

// get purchased plan
export const getSubscrioptionDetails =  async (req, res) => {

    // 
}
