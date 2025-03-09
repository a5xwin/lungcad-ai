//function to find token from cookie, which will then be used to find user id

import jwt from "jsonwebtoken";

const userAuth = async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({success: false, message: 'Not Authorized. Please login again!'})
    }

    try{
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);   //first we decode the token received from the cookie

        if(tokenDecode.id){
            req.body.userId=tokenDecode.id
        }
        else{
            return res.json({success: false, message: 'Not Authorized. Please login again!'})
        }

        next();
        
    }
    catch(error){
        res.json({success: false, message: error.message})
    }
}


export default userAuth;