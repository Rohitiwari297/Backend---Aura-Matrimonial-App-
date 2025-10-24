import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Basic Profile Info
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
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  height: { type: String },
  dateOfBirth: {
    type: Date,
    required: true,
  },

  // Contact & Authentication
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
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  otp: { type: String },

  // Profile Details
  profilePhotos: [
    {
      url: { type: String },
      publicId: { type: String },
    },
  ],
  religion: { type: String },
  caste: { type: String },
  subcaste: { type: String },
  education: { type: String },
  otherQualification: { type: String },
  occupation: { type: String },
  annualIncome: { type: String },
  workLocation: { type: String },
  employedIn: { type: String },
  maritalStatus: { type: String },
  horoscope: { type: String },

  // Location
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
  },

  // Partner Preferences (optional for registration)
  partnerPreferences: {
    ageRange: {
      min: { type: Number },
      max: { type: Number },
    },
    heightRange: {
      min: { type: String },
      max: { type: String },
    },
    religion: { type: String },
    caste: { type: String },
    location: {
      state: { type: String },
      city: { type: String },
    },
    education: { type: String },
    otherQualification: { type: String },
    occupation: { type: String },
    income: { type: String },
    language: { type: String },
    manglik: { type: String },
  },

  // Social / Connection System
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

  // Meta Info
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
