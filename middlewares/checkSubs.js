import SubscriptionDetails from "../models/subscriptionDetailsSchma.js";
import SubscriptionPlan from "../models/subscriptionPlanSchema.js";
import User from "../models/userSchema.js";


export const validateSubscriptions  = async (req, res, next) => {

  try {
    // Check if user has active subscription
    //validation for user
    const userId = req.user._id;
    console.log('requesting body:' , userId)

    const subscriptionDetails = await SubscriptionDetails.findOne({
      user_id: userId,
      expiryDate: { $gte: new Date() },
    });
    if (!subscriptionDetails) {
      return res.status(401).json({
        success: false,
        message: "User does not have an active Plan",
      });
    }


    /**
     * if user has subscription plan then what is the maxMessageRequests in user's plan 
     * if user's maxMessageRequests exceeded then user can't send message any people
     * means assume maxMessageRequests = 10 then user can chat with only 10 deferent profiles
     */

    // Check if user has exceeded maxMessageRequests
    const subscriptionPlan = await SubscriptionPlan.findById(subscriptionDetails.subscription_plan_id);
    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }
    const userMessageCount = await SubscriptionPlan.countDocuments({
      sender: userId,
    });
    if (userMessageCount >= subscriptionPlan.maxMessageRequests) {
      return res.status(401).json({
        success: false,
        message: "User has exceeded max message requests",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check subscription",
      error: error.message,
    });
  }
}



// export default validateSubscriptions;
