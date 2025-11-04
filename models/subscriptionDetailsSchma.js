import mongoose from "mongoose";

const subscriptionDetailsSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", required: true 
},
  subscription_plan_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubscriptionPlan", 
    required: true 
},
  customer_id: { 
    type: String, 
    required: true 
},
  plan_amount: { 
    type: Number, 
    required: true 
},
  remainingFollowRequests: { 
    type: Number, 
    default: 0 
},
  isActive: { 
    type: Boolean, 
    default: true 
},
  expiryDate: { 
    type: Date, 
    required: true 
}
}, { timestamps: true });

const SubscriptionDetails = mongoose.model("SubscriptionDetails", subscriptionDetailsSchema);
export default SubscriptionDetails;

