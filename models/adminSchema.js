import mongoose from "mongoose";
import { roleTypes } from "../utils/constants";

const adminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    roleType: {
        type: String,
        enum: [roleTypes.user, roleTypes.admin],
        default: roleTypes.user,
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
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    otp: { type: String },
})

const ADMIN = mongoose.model('ADMIN', adminSchema);
export default ADMIN;