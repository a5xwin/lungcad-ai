import express from 'express';
import userAuth, { authorizeRoles } from '../middleware/userAuth.js';
import { getUserData } from '../controllers/userController.js';
import { downloadPdf } from '../controllers/pdfController.js';

const userRouter = express.Router();

// ✅ Regular users & admins can access user data
userRouter.get('/data', userAuth, getUserData);

// Route to download patient summary PDF
userRouter.get('/download-pdf', userAuth, downloadPdf);

// ✅ Example: Only doctors can access doctor-specific routes
userRouter.get('/doctor-dashboard', userAuth, authorizeRoles('doctor'), (req, res) => {
    res.json({ success: true, message: "Welcome Doctor!" });
});

// ✅ Example: Admins only
userRouter.get('/manage-users', userAuth, authorizeRoles('admin'), (req, res) => {
    res.json({ success: true, message: "Admin Access: Manage Users" });
});

export default userRouter;
