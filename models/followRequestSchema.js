import mongoose from "mongoose";

const followRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  followers: {
    type: [String],
    default: [],
  },
  followings: {
    type: [String],
    default: [],
  },
  followRequests: {
    type: [String],
    default: [],
  },
  sentRequests: {
    type: [String],
    default: [],
  },
  blockedUsers: {
    type: [String],
    default: [],
  },
  // sorting user list
sortListUser: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }
],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {timestamps: true});

const SocialMedia = mongoose.model("SocialMedia", followRequestSchema);
export default SocialMedia;
