import mongoose from "mongoose";

const subscriptionDetailsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subscription_plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    required: true
  },

  activeDate :{
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  }

}, { timestamps: true });

const SubscriptionDetails = mongoose.model("SubscriptionDetails", subscriptionDetailsSchema);
export default SubscriptionDetails;

