import userModel from "../models/usermodel.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found!" });
        }
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
                role: user.role  // Added role field
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
