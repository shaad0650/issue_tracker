import bcrypt from "bcrypt"
import prisma from "../config/db.js"
import jwt from "jsonwebtoken"

const ACCESS_EXPIRES_IN="15m"
const REFRESH_EXPIRES_DAYS=7;

const generateAccessToken=(user)=>{
    return jwt.sign({userId:user.id,role:user.role},
        process.env.JWT_ACCESS_SECRET,
        {expiresIn:ACCESS_EXPIRES_IN}
    );
};

//register controller

export const register=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:"Missing feilds"})
        }
        const existing=await prisma.user.findUnique({where:{email}})
        if(existing){
            return res.status(409).json({message:"User already exists"})
        }
        const passwordHash=await bcrypt.hash(password,12)

        const user=await prisma.user.create({
            data:{email,passwordHash},
        });

        res.status(201).json({message:"User created successfully"});
    } catch (error) {

        console.log("Register controller error",error.message);
        return res.status(500).json({message:"Internal server error",error:error.message})
    }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: `${REFRESH_EXPIRES_DAYS}d` }
    );
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
        ),
      },
    });

 
    return res.json({ accessToken, refreshToken });

  } catch (error) {
    
    console.error("Login Error:", error.message);

    
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Missing refresh token" });
        }

        const stored = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });

        if (!stored || stored.expiresAt < new Date()) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        const payload = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await prisma.user.findUnique({
            where: { id: payload.userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newAccessToken = generateAccessToken(user);

        return res.json({ accessToken: newAccessToken });

    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

