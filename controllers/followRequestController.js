
// BD models
import User from "../models/userSchema.js";
import SocialMedia from "../models/followRequestSchema.js";



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

    /** STEP 1 — Check if target user exists **/
    const userExists = await User.findById(userTwoId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    /** STEP 2 — Ensure social profiles exist for both users **/
    let requesterSocial = await SocialMedia.findOne({ userId: userOneId });
    if (!requesterSocial) {
      requesterSocial = await SocialMedia.create({ userId: userOneId });
    }

    let targetSocial = await SocialMedia.findOne({ userId: userTwoId });
    if (!targetSocial) {
      targetSocial = await SocialMedia.create({ userId: userTwoId });
    }

    /** STEP 3 — Prevent duplicates **/
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

    /** STEP 4 — Add follow request **/
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

    const userSocial = await SocialMedia.findOne({ userId: loggedInUserId })
      .populate("followers", "name username email profilePic");

    if (!userSocial) {
      return res.status(404).json({ success: false, message: "Social profile not found" });
    }

    return res.status(200).json({
      success: true,
      followers: userSocial.followers,
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


// get all followings list
export const getFollowingList = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const userSocial = await SocialMedia.findOne({ userId: loggedInUserId })
      .populate("followings", "name username email profilePic");

    if (!userSocial) {
      return res.status(404).json({ success: false, message: "Social profile not found" });
    }

    return res.status(200).json({
      success: true,
      followings: userSocial.followings,
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};



