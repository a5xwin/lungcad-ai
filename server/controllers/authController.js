import bcrypt from 'bcryptjs'; // for password hashing
import jwt from 'jsonwebtoken'; // for token generation
import userModel from '../models/usermodel.js';
import transporter from '../config/nodemailer.js';

// ✅ User Registration Function
export const register = async (req, res) => {
    console.log("Register endpoint hit!");  // Debug log
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing Credentials!" });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 7);
        // Store role in lowercase for consistency
        const user = new userModel({ name, email, password: hashedPassword, role: role.toLowerCase() });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 604800000
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Welcome aboard, ${name}! 🎉`,
            text: `Hey there! Your account with the email: ${email} has been successfully created. Your assigned role is: ${user.role}.`
        };

        await transporter.sendMail(mailOptions);
        return res.json({ success: true });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ User Login Function (with role verification)
export const login = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.json({ success: false, message: "Email, Password, and Role are required!" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid email or password!" });
        }

        // Check if provided role matches the stored role (both in lowercase)
        if (user.role !== role.toLowerCase()) {
            return res.json({ success: false, message: "Incorrect role provided!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password!" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 604800000
        });

        return res.json({ success: true, role: user.role });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ Logout Function
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged Out!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ Send OTP for Account Verification
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified!" });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + (24 * 60 * 60 * 1000);
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Account Verification OTP`,
            text: `Your OTP is ${otp}`
        };

        await transporter.sendMail(mailOption);
        res.json({ success: true, message: 'Verification OTP sent!' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ Verify Email Function
export const verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await userModel.findById(userId);
        if (!user || user.verifyOtp !== otp || Date.now() > user.verifyOtpExpireAt) {
            return res.json({ success: false, message: "Invalid or expired OTP!" });
        }
        user.isAccountVerified = true;
        user.verifyOtp = null;
        user.verifyOtpExpireAt = null;
        await user.save();
        res.json({ success: true, message: "Account successfully verified!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ Check Authentication Status
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ Send OTP for Password Reset
export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found!" });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + (15 * 60 * 1000);
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Password Reset OTP`,
            text: `Your OTP to reset your password is: ${otp}. It will expire in 15 minutes.`
        };

        await transporter.sendMail(mailOption);
        res.json({ success: true, message: "Password reset OTP sent!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ Reset Password Function
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await userModel.findOne({ email });
        if (!user || user.resetOtp !== otp || Date.now() > user.resetOtpExpireAt) {
            return res.json({ success: false, message: "Invalid or expired OTP!" });
        }
        user.password = await bcrypt.hash(newPassword, 7);
        user.resetOtp = null;
        user.resetOtpExpireAt = null;
        await user.save();
        res.json({ success: true, message: "Password reset successful!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
