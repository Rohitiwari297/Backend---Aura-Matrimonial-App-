import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  trialPeriodDays: { 
    type: Number, 
    default: 0 
  },
  amountPaid: { 
    type: Number,  
  },
  type: { 
    type: Number, 
    required: true 
  },
  maxFollowRequests: { 
    type: Number, 
    required: true, 
    default: 10 
  }
}, { timestamps: true });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
export default SubscriptionPlan;

