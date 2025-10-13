import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  profileType: {
    type: String,
    enum: ["self", "relative", "son", "daughter", "brother", "sister", "client", "other"],
    required: true,
    default: "self",
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  //After login
  profilePhotos: [
    {
      url: { type: String },
      publicId: { type: String },
    },
  ],
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  religion: String,
  caste: String,
  education: String,
  occupation: String,
  location: {
    city: String,
    state: String,
    country: String,
  },
  about: String,

  //after login
  partnerPreferences: {
    ageRange: {
      min: { type: Number },
      max: { type: Number },
    },
    height: { type: String },
    religion: { type: String },
    caste: { type: String },
    location: {
      state: { type: String },
      city: { type: String }
    },
    education: { type: String },
    occupation: { type: String },
    income: { type: String },
    language: { type: String },
    manglik: { type: String }
  },
  followers: {
    type: String
  },
   followings: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
