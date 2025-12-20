import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
  name: { 
    type: String, 
    //required: true 
  },
  price: { 
    type: Number, 
    //required: true 
  },
  maxMessageRequests: {     //chenge mexFollowRequest -> maxMessageRequest
    type: Number, 
    //required: true, 
    default: 10 
  },
  validity_days: {
    type: Number,
    //required: true
  }
}, { timestamps: true });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
export default SubscriptionPlan;

