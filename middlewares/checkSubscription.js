import SubscriptionDetails from "../models/subscriptionDetailsSchema.js";
import SubscriptionPlan from "../models/subscriptionPlanSchema.js";
import User from "../models/userSchema.js";

export const createSubscription = async (req, res) => {
  try {
    console.log('req.body', req.body)
    const { userId, subscription_plan_id, customer_id, plan_amount } = req.body;

    // Find the selected plan
    const plan = await SubscriptionPlan.findById(subscription_plan_id);
    if (!plan) {
        return res.status(404).json({ 
            success: false,
            message: "Subscription plan not found" 
        });
    }

    // Calculate expiry date using expiryDays from the plan
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.expiry_days);

    // Create subscription details
    const newSubscription = new SubscriptionDetails({
      user_id: userId,
      subscription_plan_id: subscription_plan_id,
      customer_id,
      plan_amount,
      remainingFollowRequests: plan.maxFollowRequests,
      expiryDate,
      isActive: true,
    });

    // Save subscription and update user
    await newSubscription.save();
    await User.findByIdAndUpdate(userId, { is_subscribed: true });

    res.status(201).json({
        success: false,
        message: "Subscription created successfully",
        subscription: newSubscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ 
        success: false,
        message: "Internal server error" 
    });
  }
};
