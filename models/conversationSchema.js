import mongoose from "mongoose";
import User from '../models/userSchema.js'
import Message from '../models/messageSchema.js'

// creating Schema of Conversation
const conversationSchema = new mongoose.Schema({
    participents: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        }
    ],
    messages: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: []
        }
    ],

},{
    timestamps: true,
})

//creating a model of Conversation
const Conversation = mongoose.model('Conversation', conversationSchema);

//exporting the Conversation model
export default Conversation;