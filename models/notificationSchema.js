import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    receivedId: {                                       // 
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    senderId: {                                         //
        type: mongoose.Schema.Types.ObjectId,
    },
    message: {
        type: String,
    },
    title: {
        type: String
    }
    ,
    photo: {
        type: String,
    }

},
{timestamps: true})

// CREATE MODEL OF THE SCHEMA
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;