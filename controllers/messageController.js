//imports
import Conversation from '../models/conversationSchema.js'
import Message from '../models/messageSchema.js';

//import { io } from "../socketIO/socketServer.js"; // import io instance
import { io, onlineUsers } from "../socketIO/socketServer.js";


// send message with socket.io
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id;
    const loggedInUserId = req.user._id;

    if (!message || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Message and receiverId required",
      });
    }

    let conversation = await Conversation.findOne({
      participents: { $all: [receiverId, loggedInUserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participents: [receiverId, loggedInUserId],
        messages: [],
      });
    }

    const newMessage = await Message.create({
      senderId: loggedInUserId,
      receiverId,
      message,
      conversationId: conversation._id,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const payload = {
      _id: newMessage._id,
      message: newMessage.message,
      senderId: loggedInUserId.toString(),
      receiverId: receiverId.toString(),
      createdAt: newMessage.createdAt,
    };

    //  SOCKET EMIT
    const receiverSocketId = onlineUsers.get(receiverId.toString());
    console.log('receiverSocketId', receiverSocketId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", payload);
    }

    if (!receiverSocketId) {
      console.log("Receiver offline, message saved only");
    } else {
      io.to(receiverSocketId).emit("newMessage", payload);
    }


    const senderSocketId = onlineUsers.get(loggedInUserId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", payload);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: payload,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Send message error",
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


// List of initiating chat user
export const getChatHistoryUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user?._id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const conversations = await Conversation.find({
      participents: loggedInUserId,
    }).populate("participents", "fullName profilePhotos");

    if (!conversations.length) {
      return res.status(404).json({
        success: false,
        message: "No chat history found",
      });
    }

    const usersMap = new Map();

    conversations.forEach((conv) => {
      const otherUser = conv.participents.find(
        (user) => user._id.toString() !== loggedInUserId.toString()
      );

      if (otherUser) {
        usersMap.set(otherUser._id.toString(), {
          _id: otherUser._id,
          fullName: otherUser.fullName,
          profilePhoto: otherUser.profilePhotos?.[0]?.url || null,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Chat history users fetched successfully",
      data: Array.from(usersMap.values()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while getting chat history",
      error: error.message,
    });
  }
};


