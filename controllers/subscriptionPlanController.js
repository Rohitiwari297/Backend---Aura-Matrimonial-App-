// Subscription Controller
import SubscriptionPlan from '../models/subscriptionPlanSchema.js';

export const createSubscriptionPlan = async (req, res) => {
  try {

    console.log("Request Body:", req.body);
    // Extract plan details from request body
    const { name, price,validity_days, trialPeriodDays, type, amountPaid, maxMessageRequests } = req.body;

    // Validate required fields
    if (!name || !validity_days || !price || !maxMessageRequests === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check if a plan with the same name already exists
    const existingPlan = await SubscriptionPlan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "A subscription plan with this name already exists"
      });
    }

    // Create new subscription plan
    const newPlan = new SubscriptionPlan({
      name,
      price,
      trialPeriodDays,
      type,
      validity_days,
      amountPaid,
      maxMessageRequests
    });

    await newPlan.save();

    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: newPlan
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create plan",
      error: error.message
    });
  }
};


// Edit Subscription Plan - To be implemented
export const editSubscriptionPlan = async (req, res) => {
  // Implementation for editing a subscription plan

    const planId = req.params.id;
    const { name, price, trialPeriodDays, type, amountPaid, maxMessageRequests, validity_days } = req.body;
    
    //validation
    if (!name || !price || maxMessageRequests === undefined ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }


    // Check if subscription plan exists
    const subscription = await SubscriptionPlan.findById(planId)

    //validation
    if (!subscription){
        res.status(404).json({
            success: false,
            message: 'Plan not exists'
        })
    }

    // if exists, update the plan
    subscription.name = name;
    subscription.price = price;
    subscription.trialPeriodDays = trialPeriodDays;
    subscription.type = type;
    subscription.amountPaid = amountPaid;
    subscription.maxMessageRequests = maxMessageRequests;
    subscription.validity_days = validity_days;

    // save the updates
    await subscription.save();

    //send response to client
    res.status(200).json({
        success: true,
        message: 'Plan update successfully',
        data: subscription
    })

};

// Delete Subscription Plan - To be implemented || not tested
export const deleteSubscriptionPlan = async (req, res) => {
  // Implementation for deleting a subscription plan

    // Extract plan ID from request parameters
    const planId = req.params.id;

    // Check if subscription plan exists
    const subscription = await SubscriptionPlan.findById({planId})

    //validation
    if (!subscription){
        res.status(404).json({
            success: false,
            message: 'Plan not exists'
        })
    }

    // if exists, delete the plan
    await SubscriptionPlan.findByIdAndDelete(planId);

    //send response to client
    res.status(200).json({
        success: true,
        message: 'Plan deleted successfully'
    });

    // End of function

};

//Get All Subscription Plans 
export const getAllSubscriptionPlan = async (req, res) => {
    // Implementation for fetching all subscription plans
    try {
        const plans = await SubscriptionPlan.find();

        //validation 
        if (!plans || plans.length === 0 ) {
            res.status(200).json({
                success: true,
                message: 'No plan found',
                data: []
            })
        } else {
            res.status(200).json({
                success: true,
                message: 'Plans fetched successfully',
                data:  plans
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


