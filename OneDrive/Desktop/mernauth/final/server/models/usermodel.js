import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verifyOtp: {type: String, default: ''},
    verifyOtpExpireAt: {type: Number, default: 0},            //stores the otp time limit
    isAccountVerified: {type: Boolean, default: false},     //stores info regarding whether current account is verified by otp or not
    resetOtp: {type: String, default: ''},      
    resetOtpExpireAt: {type: Number, default: 0},     
})

const userModel = mongoose.models.user || mongoose.model('user',userSchema) //searches for existing user or creates a new one

export default userModel;