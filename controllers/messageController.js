//imports
import Conversation from '../models/conversationSchema.js'
import Message from '../models/messageSchema.js';

import { io } from "../socketIO/socketServer.js"; // import io instance

// Controllers

// send message without socket.io
// export const sendMessage = async (req, res) => {
//     // 
//     try {
//         const {message} = req.body;
//         const receiverId = req.params.id;
//         const loggedInuserId = req.user._id;

//         //console 
//         console.log('message :', message)
//         console.log('receiver Id :', receiverId)
//         console.log('loggedIn user Id :', loggedInuserId)

//         // find in coversation of user Id's of both user
//         let conversation = await Conversation.findOne({
//             // now we have to find in which attribute = participant
//             participents: { $all: [receiverId, loggedInuserId]},
//             messages: []  // initialize messages array if your schema doesn’t default it
//         })

//         // if in conversation both Id's are not exists the save the Id's in conversation
//         if ( !conversation ) {
//             await Conversation.create({      //here we create the initiate the conversation but not save here
//                 participents: [receiverId, loggedInuserId]
//             })
//         }

//         //now save the message which is send the sender
//         const newMessage = new Message({
//             senderId: loggedInuserId,
//             receiverId,
//             message
//         })

//         if (newMessage){
//             //if mssg then save the mssg
//             //await newMessage.save()   //we have to save parallelly with await conversation.save()
//             //after that push the mssgs in conversation's messages in conversation Schema
//             conversation.messages.push(newMessage._id)
//             //now here save the conversation
//             //await conversation.save()  //we have to save parallelly with "await conversation.save()"
            
//             //send the success response to the user
            

//             // use promises for the saving messages and conversations parallelly
//             await Promise.all([newMessage.save(), conversation.save()])
//             res.status(201).json({
//                 success: true,
//                 message: 'message send successfully',
//                 data: newMessage
//             })

//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error while sending the message',
//             error: error.message
//         })
//     }
// }


// send message with socket.io
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id;
    const loggedInuserId = req.user._id;

    console.log('requesting messagge:', message)

    let conversation = await Conversation.findOne({
      participents: { $all: [receiverId, loggedInuserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participents: [receiverId, loggedInuserId],
      });
    }

    const newMessage = new Message({
      senderId: loggedInuserId,
      receiverId,
      message,
    });

    await Promise.all([newMessage.save(), conversation.save()]);

    // Emit a real-time event to the receiver
    io.emit("newMessage", {
      senderId: loggedInuserId,
      receiverId,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while sending the message",
      error: error.message,
    });
  }
};


// get message by Id
export const getMessage = async (req, res) => {
    try {
        const receiverId = req.params.id;
        const loggedInUserId = req.user._id;

        // Find ALL conversations between the two users
        const conversations = await Conversation.find({
            participents: { $all: [receiverId, loggedInUserId] }
        }).populate("messages");

        // Validate if conversations exist
        if (!conversations || conversations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No conversation found between these users'
            });
        }

        // Extract messages from all conversations
        const allMessages = conversations.flatMap(conv => conv.messages);

        res.status(200).json({
            success: true,
            message: 'Messages fetched successfully',
            data: allMessages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while getting the messages',
            error: error.message
        });
    }
};
