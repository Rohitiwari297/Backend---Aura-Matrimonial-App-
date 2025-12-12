import SubscriptionDetails from "../models/subscriptionDetailsSchma.js";
import SubscriptionPlan from "../models/subscriptionPlanSchema.js";
import User from "../models/userSchema.js";
import Message from "../models/messageSchema.js";

export const validateSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const receivedId = req.params.id;
    console.log('receivedId:', receivedId)

    // 1. Check active subscription
    const subscriptionDetails = await SubscriptionDetails.findOne({
      user_id: userId,
      expiryDate: { $gte: new Date() },
    });

    //console.log('subscription details:', subscriptionDetails)

    if (!subscriptionDetails) {
      return res.status(401).json({
        success: false,
        message: "User does not have an active Plan",
      });
    }

    // 2. Fetch plan info
    const subscriptionPlan = await SubscriptionPlan.findById(
      subscriptionDetails.subscription_plan_id
    );

    //console.log('subscriptionPlan details:', subscriptionPlan)

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // 3. Count user sent messages (unique receivers)
    const uniqueReceivers = await Message.distinct("receiverId", {
      senderId: userId,
    });

    console.log('uniqueReceivers details:', uniqueReceivers)


    // check previous chat with receiver (new way using some || )
    const alreadyChatted = uniqueReceivers.some( 
      id => id.equals(receivedId)
    )
    console.log('alreadyChatted', alreadyChatted)


    //find length of how 
    const userMessageCount = uniqueReceivers.length;
    console.log('available message request:',userMessageCount - subscriptionPlan.maxMessageRequests)

    // if Login user try to message of new user
    if (!alreadyChatted){
      if (userMessageCount >= subscriptionPlan.maxMessageRequests) {
        return res.status(401).json({
          success: false,
          message: "User has exceeded max message requests",
        });
      }
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check subscription",
      error: error.message,
    });
  }
};
