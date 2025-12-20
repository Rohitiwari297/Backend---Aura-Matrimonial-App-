// WRITTING NOTIFICATION CONTROLLER

import Notification from "../models/notificationSchema.js";
<<<<<<< HEAD
import { sendNotification } from "../services/sendNotification.js";
=======
>>>>>>> 90aecdb9db7c7d089dfb2b2da8b259a87fc6c131

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

<<<<<<< HEAD
        // SAVE NOTIFICATION IN BD
=======
>>>>>>> 90aecdb9db7c7d089dfb2b2da8b259a87fc6c131
        const notifyMessage = await new Notification({
            receivedId: receivedId,
            title: title,
            message: message,
        }).save()

<<<<<<< HEAD
        // SEND NOTIFICATION VIA FIREBASE BY TOKEN
        await sendNotification( title, message)
=======

>>>>>>> 90aecdb9db7c7d089dfb2b2da8b259a87fc6c131

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

<<<<<<< HEAD
//GET ALL NOTIFICATIONS DATA
export const getNotificationData = async (req, res) => {
    // GETTING ALL NOTIFICATION MESSAGE
    const userIdQuery = req.query.id
    try {
        const queryObj = {}
        if (userIdQuery) {
            queryObj.receivedId = userIdQuery
        }

        console.log('queryObj:', queryObj)

        //FETCH THE DATA IS ALL REQUIREMENT ARE VALID
        const notificationDate = await Notification.find(queryObj)
        if (!notificationDate || notificationDate.length <= 0) {
            res.status(400).json({
                success: false,
                message: 'Data not found or empty data'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            Data: notificationDate
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching the notification data',
            error: error.message
        })
    }
}

// DELETE NOTIFICATION BY ID
export const deleteNotification = async (req, res) => {
    const notificationId = req.params.id;
    const user = req.user?._id;

    console.log('notificationId:', notificationId)
    console.log('userId:', user)

    try {
        //VALIDATIONS FOR THE REQUIRED FIELDS 
        if (!notificationId) {
            res.status(400).json({
                success: false,
                message: 'Notification id is required'
            })
        }

        // MATCHED THE BOTH ID's USERID AND NOTIFICATION ID
        const deletedData = await Notification.findOneAndDelete({
            _id: notificationId,
            receivedId: user
        });

        if (!deletedData) {
            res.status(404).json({
                success: false,
                message: 'Notification not found or unauthorized'
            })
        }

        //SEND THE POSSITIVE RESPONSE TO THE USER
        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
            data: deletedData
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error while deleting the notification',
            error: error.message
        })
    }
}

// 
=======

//GET ALL NOTIFICATIONS DATA
export const getNotificationData = async (req, res) => {
 
}
>>>>>>> 90aecdb9db7c7d089dfb2b2da8b259a87fc6c131
