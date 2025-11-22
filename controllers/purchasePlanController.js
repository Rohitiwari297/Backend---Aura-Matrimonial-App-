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
            maxMessageRequests: plan.maxMessageRequests,
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

        // //change status of is_subscribe
        // if (user) {
        //     await User.findOneAndUpdate(
        //         { _id: user._id },
        //         { $set: { is_subscribe: true } }
        //     );
        // }


        
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
export const getSubscriptionDetails = async (req, res) => {
    try {

        //  get user ID
        const userId = req.user._id;

        //validation for  userId
        if (!userId) {
            res.status(404).json({
                success: false,
                message: 'Unauthorised: userId not present in token'
            })
        }

        // find details in db as per userId
        const subscriptionDetails = await SubscriptionDetails.findOne({ user_id: userId });
        if (!subscriptionDetails) {
            res.status(404).json({
                success: false,
                message: 'Subscription details not found'
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Subscription details fetched successfully',
                data: subscriptionDetails
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch subscription details",
            error: error.message
        });
    }
};

// get count of expired plan
export const getExpPlan = async (req, res) => {
    try {
        const currentDate = new Date();

        const expiredUsers = await SubscriptionDetails.aggregate([
            {
                $sort: { activeDate: -1 } // latest plan first
            },
            {
                $group: {
                    _id: "$user_id",
                    latestPlan: { $first: "$$ROOT" }
                }
            },
            {
                $match: {
                    "latestPlan.expiryDate": { $lte: currentDate }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails",
                    pipeline: [{$project: {fullName: 1, email: 1, phone: 1, gender: 1, is_subscribed: 1, activeDate: 1, expiryDate: 1}}]
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Expired users fetched successfully",
            count: expiredUsers.length,
            data: expiredUsers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch expired plans",
            error: error.message
        });
    }
};


// active users
/**
 * on the basis of:
 *  The plan has already started
 *  The plan has NOT expired
 *  Any older expired plan is ignored
 */
export const getActiveUsers = async (req, res) => {
    try {
        const currentDate = new Date();

        const activeUsers = await SubscriptionDetails.aggregate([
            {
                $sort: { activeDate: -1, _id: -1 }
            },
            {
                $group: {
                    _id: "$user_id",
                    latestPlan: { $first: "$$ROOT" }
                }
            },
            {
                $match: {
                    "latestPlan.activeDate": { $lte: currentDate },
                    "latestPlan.expiryDate": { $gt: currentDate }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails",
                    pipeline: [{$project: {fullName: 1, email: 1, phone: 1, gender: 1, is_subscribed: 1, activeDate: 1, expiryDate: 1}}]

                }
            },
            { $unwind: "$userDetails" }
        ]);

        res.status(200).json({
            success: true,
            message: "Active users fetched successfully",
            data: activeUsers,
            count: activeUsers.length,
            //users: activeUsers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch active users",
            error: error.message
        });
    }
};


