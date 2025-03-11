import jwt from "jsonwebtoken";

// Middleware to authenticate user and extract role
const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized. Please login again!' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET); // Decode token

        if (tokenDecode.id) {
            req.body.userId = tokenDecode.id;
            req.body.role = tokenDecode.role; // ✅ Store user role in request
        } else {
            return res.json({ success: false, message: 'Not Authorized. Please login again!' });
        }

        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ Middleware for Role-Based Access Control
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.body.role)) {
            return res.json({ success: false, message: 'Access Denied: Insufficient Permissions' });
        }
        next();
    };
};

export default userAuth;
