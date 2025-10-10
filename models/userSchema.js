import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  religion: {
    type: String,
  },
  caste: {
    type: String,
  },
  occupation: {
    type: String,
  },
  education: {
    type: String,
  },
  location: {
    city: String,
    state: String,
    country: String,
  },
  about: {
    type: String,
    maxlength: 500,
  },
  profilePhoto: {
    type: String, // Cloudinary URL or image path
  },
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
