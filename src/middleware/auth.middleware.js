import jwt from "jsonwebtoken"

export const requireAuth=(req,res,next)=>{
    const header=req.headers.authorization;
    if(!header){
        return res.status(401).json({message:"Missing token"})
    }
    const token=header.split(" ")[1]

    try {
        const payload=jwt.verify(token,process.env.JWT_ACCESS_SECRET);
        req.user=payload;
        next()
    } catch (error) {
        res.status(401).json({message:"Invalid token"})
    }
}