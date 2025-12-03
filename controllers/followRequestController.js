
// BD models
import User from "../models/userSchema.js";
import SocialMedia from "../models/followRequestSchema.js";
import mongoose from "mongoose";



//controllers

//Sent Request
export const sendFollowRequest = async (req, res) => {
  try {
    const userOneId = req.user._id;
    const userTwoId = req.params.id;

    if (userOneId.toString() === userTwoId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You can't follow yourself"
      });
    }

    /**  Check if target user exists **/
    const userExists = await User.findById(userTwoId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    /**  — Ensure social profiles exist for both users **/
    let requesterSocial = await SocialMedia.findOne({ userId: userOneId });
    if (!requesterSocial) {
      requesterSocial = await SocialMedia.create({ userId: userOneId });
    }

    let targetSocial = await SocialMedia.findOne({ userId: userTwoId });
    if (!targetSocial) {
      targetSocial = await SocialMedia.create({ userId: userTwoId });
    }

    /**  — Prevent duplicates **/
    if (targetSocial.followers.includes(userOneId)) {
      return res.status(400).json({
        success: false,
        message: "Already following this user"
      });
    }

    if (targetSocial.followRequests.includes(userOneId)) {
      return res.status(400).json({
        success: false,
        message: "Follow request already sent"
      });
    }

    /**  — Add follow request **/
    await SocialMedia.findOneAndUpdate(
      { userId: userTwoId },
      { $addToSet: { followRequests: userOneId } }
    );

    await SocialMedia.findOneAndUpdate(
      { userId: userOneId },
      { $addToSet: { sentRequests: userTwoId } }
    );

    return res.status(200).json({
      success: true,
      message: "Follow request sent successfully"
    });

  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

//accept Follow Request
export const acceptFollowRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;   // me
    const senderId = req.params.id;    // who sent request

    let receiver = await SocialMedia.findOne({ userId: receiverId });
    let sender = await SocialMedia.findOne({ userId: senderId });

    if (!receiver || !sender) {
      return res.status(404).json({ success: false, message: 'User social profile missing' });
    }

    // check if request exists
    if (!receiver.followRequests.includes(senderId)) {
      return res.status(400).json({ success: false, message: 'No follow request from this user' });
    }

    // Update receiver: remove request + add follower
    await SocialMedia.updateOne(
      { userId: receiverId },
      {
        $pull: { followRequests: senderId },
        $addToSet: { followers: senderId }
      }
    );

    // Update sender: remove sent request + add following
    await SocialMedia.updateOne(
      { userId: senderId },
      {
        $pull: { sentRequests: receiverId },
        $addToSet: { followings : receiverId }
      }
    );

    return res.status(200).json({ success: true, message: "Follow request accepted" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


//reject Follow Request
export const rejectFollowRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const senderId = req.params.id;

    let receiver = await SocialMedia.findOne({ userId: receiverId });
    let sender = await SocialMedia.findOne({ userId: senderId });

    if (!receiver || !sender) {
      return res.status(404).json({ success: false, message: "User social profile missing" });
    }

    // check if request exists
    if (!receiver.followRequests.includes(senderId)) {
      return res.status(400).json({ success: false, message: "No follow request from this user" });
    }

    // Remove from both lists
    await SocialMedia.updateOne(
      { userId: receiverId },
      { $pull: { followRequests: senderId } }
    );

    await SocialMedia.updateOne(
      { userId: senderId },
      { $pull: { sentRequests: receiverId } }
    );

    return res.status(200).json({ success: true, message: "Follow request rejected" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


//Cancel Follow Request
export const cancelSendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;     // me
    const receiverId = req.params.id;  // target

    let sender = await SocialMedia.findOne({ userId: senderId });
    let receiver = await SocialMedia.findOne({ userId: receiverId });

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, message: "User social profile missing" });
    }

    // check if request exists
    if (!sender.sentRequests.includes(receiverId)) {
      return res.status(400).json({ success: false, message: "No request sent to this user" });
    }

    // Remove from both sides
    await SocialMedia.updateOne(
      { userId: senderId },
      { $pull: { sentRequests: receiverId } }
    );

    await SocialMedia.updateOne(
      { userId: receiverId },
      { $pull: { followRequests: senderId } }
    );

    return res.status(200).json({ success: true, message: "Follow request cancelled" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


// unfollow user
export const unfollowRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // me
    const targetUserId = req.params.id;  // user I'm following

    let me = await SocialMedia.findOne({ userId: loggedInUserId });
    let target = await SocialMedia.findOne({ userId: targetUserId });

    if (!me || !target) {
      return res.status(404).json({ success: false, message: "User social profile missing" });
    }

    // check if already following
    if (!target.followers.includes(loggedInUserId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user"
      });
    }

    // Remove follower → target
    await SocialMedia.updateOne(
      { userId: targetUserId },
      { $pull: { followers: loggedInUserId } }
    );

    // Remove following → me
    await SocialMedia.updateOne(
      { userId: loggedInUserId },
      { $pull: { followings: targetUserId } }
    );

    return res.status(200).json({ success: true, message: "Unfollowed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


//Block User
export const blockUserRequest = async (req, res) => {
  try {
    const myId = req.user._id;
    const targetId = req.params.id;

    let me = await SocialMedia.findOne({ userId: myId });
    let target = await SocialMedia.findOne({ userId: targetId });

    if (!me || !target) {
      return res.status(404).json({ success: false, message: "User social profile missing" });
    }

    // Remove existing follow/following relationships
    await SocialMedia.updateOne(
      { userId: myId },
      {
        $pull: {
          followers: targetId,
          followings: targetId
        }
      }
    );

    await SocialMedia.updateOne(
      { userId: targetId },
      {
        $pull: {
          followers: myId,
          followings: myId
        }
      }
    );

    // Add to blocked list
    await SocialMedia.updateOne(
      { userId: myId },
      { $addToSet: { blockedUsers: targetId } }
    );

    return res.status(200).json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


// Unblock User
export const unblockUserRequest = async (req, res) => {};


// get all follower list
export const getFollowersList = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const userSocial = await SocialMedia.aggregate([
      {
        $match: {
          userId: loggedInUserId
        }
      },
      {
        $addFields: {
          followers: {
            $map: {
              input: "$followers",
              as: "id",
              in: { $toObjectId: "$$id" }
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          let: { followerIds: "$followers" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$followerIds"] }
              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                phone: 1,
                profilePhotos: 1
              }
            }
          ],
          as: "followersDetails"
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Followers details fetched successfully",
      data: userSocial
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// get all followings list
export const getFollowingList = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const userSocial = await SocialMedia.aggregate([
      {
        $match: {
          userId: loggedInUserId
        }
      },
      {
        $addFields: {
          followings: {
            $map: {
              input: "$followings",
              as: "id",
              in: { $toObjectId: "$$id" }
            }
          }
        }
      },
      {
        $lookup: {
          from: "users", // ⬅ your User collection name (lowercase + plural)
          localField: "followings",
          foreignField: "_id",
          as: "followingDetails",
          pipeline: [
            {
              $project: {
                fullName: 1,
                email: 1,
                phone: 1,
                profilePhotos: 1
              }
            }
          ]
        }
      }
    ])

    res.status(200).json({
      success: true,
      message: 'followings details fetched successfully',
      data: userSocial
    })

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// get all send Request list with users details
export const getAllSendRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user?._id;

    const allSendRequestData = await SocialMedia.aggregate([
      {
        $match: { userId: loggedInUserId }
      },
      {
        $addFields: {
          sentRequests: {
            $map: {
              input: "$sentRequests",
              as: "id",
              in: { $toObjectId: "$$id" }
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "sentRequests",
          foreignField: "_id",
          as: "sendRequestDetails",
          pipeline: [
            {
              $project: {
                fullName: 1,
                email: 1,
                phone: 1,
                profilePhotos: 1
              }
            }
          ]
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "All send request fetched successfully",
      data: allSendRequestData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// get all received Request list with users details
export const getAllReceivedRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user?._id;

    const allReceivedRequestData = await SocialMedia.aggregate([
      {
        $match: { userId: loggedInUserId }
      },
      {
        $addFields: {
          receivedRequests: {
            $map: {
              input: "$followRequests",
              as: "id",
              in: { $toObjectId: "$$id" }
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "receivedRequests",  
          foreignField: "_id",
          as: "receivedRequestDetails",
          pipeline: [
            {
              $project: {
                fullName: 1,
                email: 1,
                phone: 1,
                profilePhotos: 1
              }
            }
          ]
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "All received request fetched successfully",
      data: allReceivedRequestData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// short list user
export const sortListUser = async (req, res) => {
  try {
    const loggedInUserId = req.user?._id;
    const receivedSortId = req.params.id;

    console.log('loggedInUserId:', loggedInUserId);
    console.log('receivedSortId:', receivedSortId);

    // Validate inputs
    if (!loggedInUserId || !receivedSortId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }

    // Check if user to be sorted exists
    const sortedUser = await User.findById(receivedSortId);
    if (!sortedUser) {
      return res.status(404).json({
        success: false,
        message: 'This userId does not exist'
      });
    }

    // Ensure sortListUser stores ObjectIds
    const convertedId = new mongoose.Types.ObjectId(receivedSortId);

    // Fetch logged-in user's SocialMedia document OR create if missing
    let socialMedia = await SocialMedia.findOne({ userId: loggedInUserId });
    if (!socialMedia) {
      socialMedia = await SocialMedia.create({
        userId: loggedInUserId,
        sortListUser: []
      });
    }

    /** 🔥 Prevent duplicates BEFORE updating **/
    if (socialMedia.sortListUser.some(id => id.toString() === receivedSortId)) {
      return res.status(409).json({
        success: false,
        message: 'User already in your sort-list'
      });
    }

    // Add to sortListUser array
    socialMedia.sortListUser.push(convertedId);
    await socialMedia.save();

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "User added to sort-list successfully",
      data: socialMedia
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error while sorting the user',
      error: error.message
    });
  }
};

// get all sort list users
export const getAllSortList = async (req, res) => {

  try {
    const loggedInUserId = req.user?._id;
    console.log('loggedInUserId', loggedInUserId)

    if (!loggedInUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request — user not found"
      });
    }

    const getAllSortListUsers = await SocialMedia.aggregate([
      {
        $match: {
          userId: loggedInUserId
        }
      },
      {
        // Convert all IDs inside sortListUser[] to ObjectId
        $addFields: {
          sortListUser: {
            $map: {
              input: "$sortListUser",
              as: "id",
              in: { $toObjectId: "$$id" }
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "sortListUser",
          foreignField: "_id",
          as: "sortUsersData"
        }
      },
      {
        $project: {
          sortUsersData: {
            fullName: 1,
            email: 1,
            phone: 1,
            profilePhotos: 1
          }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "Sortlisted users fetched successfully",
      data: getAllSortListUsers
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching sorted users",
      error: error.message
    });
  }
};









