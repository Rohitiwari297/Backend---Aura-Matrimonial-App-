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

  // subscription info can stay here also
  is_subscribed: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {timestamps: true});

const SocialMedia = mongoose.model("SocialMedia", followRequestSchema);
export default SocialMedia;
