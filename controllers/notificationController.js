// WRITTING NOTIFICATION CONTROLLER

import Notification from "../models/notificationSchema.js";

//SEND NOTIFICATION - (ONE-TO-ONE BY USER ID)
export const sendNotificaion = async (req, res) => {
    // SEND NOTIFICATION TO PARTICULAR USER
    const receivedId = req.params.id;
    const { message, title } = req.body;

    try {
        //VALIDATIONS OF REQUIRED FIELDS
        if (!receivedId || !message || !title) {
            res.status(400).json({
                success: false,
                message: 'All fields are mandatory'
            })
        }

        const notifyMessage = await new Notification({
            receivedId: receivedId,
            title: title,
            message: message,
        }).save()



        res.status(200).json({
            success: true,
            message: 'Notification save successfully',
            data: notifyMessage
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while sending the notification to particular user',
            error: error.message
        })
    }
}


//GET ALL NOTIFICATIONS DATA
export const getNotificationData = async (req, res) => {
 
}
