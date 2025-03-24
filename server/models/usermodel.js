import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Basic user details
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user", "doctor"], default: "user" },

    // OTP and verification fields
    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: 0 },

    // Additional Medical/Patient Details
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    age: { type: Number, default: 0 },
    dob: { type: Date },
    sex: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    bloodgrp: { type: String, default: "N/A" },
    smokinghabbits: { type: Number, default: 0 }, // number of years
    docName: { type: String, default: "" },
    lastVisited: { type: Date }
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
