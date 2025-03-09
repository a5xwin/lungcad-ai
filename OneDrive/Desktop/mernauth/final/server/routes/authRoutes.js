import express from 'express'
import { register,login,logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

// default link:   /api/auth

authRouter.post('/register', register);     // complete link:     /api/auth/register
authRouter.post('/login', login);           // complete link:     /api/auth/login
authRouter.post('/logout', logout);         // complete link:     /api/auth/logout
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);   //    /api/auth/send-verify-otp
authRouter.post('/verify-account', userAuth, verifyEmail);      //    /api/auth/verify-account
authRouter.get('/is-auth', userAuth, isAuthenticated);      //    /api/auth/is-auth
authRouter.post('/send-reset-otp', sendResetOtp);      //    /api/auth/send-reset-otp
authRouter.post('/reset-password', resetPassword);      //    /api/auth/reset-password

export default authRouter;
