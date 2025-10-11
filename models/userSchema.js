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
  profilePhoto: String,
  partnerPreferences: {
    ageRange: {
      min: Number,
      max: Number,
    },
    religion: String,
    caste: String,
    location: String,
    education: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
