import express from 'express';
import { register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword } from '../controllers/authController.js';
import userAuth, { authorizeRoles } from '../middleware/userAuth.js';

const authRouter = express.Router();

// Default link: /api/auth
authRouter.post('/register', register);     
authRouter.post('/login', login);           
authRouter.post('/logout', logout);         

// ✅ Protect verification and authentication routes
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);   
authRouter.post('/verify-account', userAuth, verifyEmail);      
authRouter.get('/is-auth', userAuth, isAuthenticated);      
authRouter.post('/send-reset-otp', sendResetOtp);      
authRouter.post('/reset-password', resetPassword);      

// ✅ Example: Admin-only route
authRouter.get('/admin-dashboard', userAuth, authorizeRoles('admin'), (req, res) => {
    res.json({ success: true, message: "Welcome Admin!" });
});

export default authRouter;
